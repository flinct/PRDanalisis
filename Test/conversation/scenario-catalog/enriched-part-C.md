# Conversation Scenario Catalog — Part C: Adjacent & Integration (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07
> **Source Catalog:** `Test/conversation/scenario-catalog/part-C-adjacent.md`
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **Total Scenarios:** 234 across 12 surfaces

---


## 1. PRD - Global Search (Conversation + Ticket)
- **Status:** DEVELOPED
- **Surface:** Centered popup modal (Cari sidenav / Ctrl+K) + full-page /search fallback
- **Relation to Conversation:** Discovery-only search across Conversation and Ticket domains using shared business attributes (AWB, Order ID, Tracking Number)
- **Requirement IDs:** US-001–US-007, FR-001–FR-040, EH-001–EH-007, EC-001–EC-007

### SC-GSEARCH-001 — Search by business identifier returns matching results from both domains
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-007–FR-010
- **Pre-condition:** Agent logged in; matching AWB exists in both conversation and ticket
- **Steps:**
  1. Press Ctrl+K or click 'Cari' in `[data-cy='Conversation-Sidebar-Navigation']`
  2. Verify search popup opens centered
  3. Type 'AWB-1234' in search input
  4. Verify 'Percakapan' and 'Tiket' section headers shown
  5. Verify each result shows 'Matched by' and 'Matched value'
- **Expected Result:** Results grouped by domain; each shows matched attribute; clicking opens detail
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-002 — Only Ticket section shown when only Ticket matches exist
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-020
- **Pre-condition:** Identifier only exists in ticket fields
- **Steps:**
  1. Press Ctrl+K, type 'TK-ONLY-999'
  2. Verify only 'Tiket' section visible
  3. Verify 'Percakapan' hidden entirely
- **Expected Result:** Only Tiket section; Percakapan hidden
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-003 — Only Conversation section shown when only Conversation matches
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-020
- **Pre-condition:** Identifier only in conversation attributes
- **Steps:**
  1. Press Ctrl+K, type conversation-only identifier
  2. Verify only 'Percakapan' visible
  3. Verify 'Tiket' hidden
- **Expected Result:** Only Percakapan; Tiket hidden
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-004 — Each result displays 'Matched by' with attribute key
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-021–FR-023
- **Pre-condition:** At least 1 match with known attribute
- **Steps:**
  1. Press Ctrl+K, search 'AWB-1234'
  2. Verify each card shows 'Matched by: awb'
- **Expected Result:** Matched attribute key displayed on all cards
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-005 — Each result displays 'Matched value' with normalized value
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-022
- **Pre-condition:** Search returns results
- **Steps:**
  1. Press Ctrl+K, search 'AWB-1234'
  2. Verify 'Matched value' shown with readable normalized value
- **Expected Result:** Matched value displayed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-006 — Multiple qualifying fields → only highest-priority match reason shown
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-023, EC-002
- **Pre-condition:** Record has AWB + Order ID both matching
- **Steps:**
  1. Press Ctrl+K, search identifier matching multiple fields
  2. Verify only ONE 'Matched by' per card
- **Expected Result:** Single match reason per card
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-007 — Clicking Conversation result opens Room and closes popup
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-027, FR-029
- **Pre-condition:** Popup with conversation results
- **Steps:**
  1. Press Ctrl+K, search conversation identifier
  2. Click Conversation result
  3. Verify popup closes
  4. Verify `[data-cy='Chat-Room-Container']` loads with `[data-cy='Chat-Room-Header-Contact-Name']`
- **Expected Result:** Room opens; popup closes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-008 — Clicking Ticket result opens Ticket Detail and closes popup
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-028, FR-029
- **Pre-condition:** Popup with ticket results
- **Steps:**
  1. Press Ctrl+K, search ticket identifier
  2. Click Ticket result
  3. Verify popup closes
  4. Verify Ticket Detail loads
- **Expected Result:** Ticket Detail opens; popup closes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-009 — Reopening popup restores last keyword and results
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-030
- **Pre-condition:** Previous search performed
- **Steps:**
  1. Press Ctrl+K, search 'AWB-1234', verify results
  2. Close via Esc
  3. Press Ctrl+K again
  4. Verify keyword and results restored
- **Expected Result:** Session state restored
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-010 — Clicking Cari in sidenav opens centered popup modal
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-001–FR-002
- **Pre-condition:** Agent on conversation page
- **Steps:**
  1. Click 'Cari' in `[data-cy='Conversation-Sidebar-Navigation']`
  2. Verify centered popup with backdrop
  3. Verify page visible behind modal
- **Expected Result:** Centered popup with backdrop
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-011 — Ctrl+K opens popup with input auto-focused
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-003
- **Pre-condition:** Agent logged in
- **Steps:**
  1. Press Ctrl+K
  2. Verify popup opens with input focused
  3. Type to confirm focus
- **Expected Result:** Auto-focused input
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-012 — Scoped agent sees only allowed records
- **Type:** Permission | **Priority:** P0 | **Source:** US-005, FR-005–FR-006, EH-005
- **Pre-condition:** Agent with limited scope
- **Steps:**
  1. Log in as scoped agent
  2. Search identifier with cross-scope matches
  3. Verify only accessible results
  4. Verify no hint about excluded
- **Expected Result:** Scope-filtered results only
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-013 — Search tenant-scoped by companyId/organizationId
- **Type:** Permission | **Priority:** P0 | **Source:** FR-006
- **Pre-condition:** Two tenants with same identifiers
- **Steps:**
  1. Log in as Tenant A
  2. Search identifier in both tenants
  3. Verify only Tenant A results
- **Expected Result:** No cross-tenant leakage
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-014 — Loading state shows 'Mencari...'
- **Type:** State | **Priority:** P0 | **Source:** US-006, FR-034
- **Pre-condition:** Agent logged in
- **Steps:**
  1. Press Ctrl+K, type keyword
  2. Verify 'Mencari...' during fetch
  3. Verify disappears on result
- **Expected Result:** Loading indicator shown during fetch
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-015 — Empty state shows 'Tidak ada data terkait ditemukan.'
- **Type:** State | **Priority:** P0 | **Source:** US-006, FR-035
- **Pre-condition:** No matches exist
- **Steps:**
  1. Press Ctrl+K, type 'NOMATCH-XYZ-999'
  2. Verify 'Tidak ada data terkait ditemukan.'
- **Expected Result:** Empty state in Bahasa
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-016 — Ticket fails, Conversation succeeds → partial results with retry
- **Type:** Negative | **Priority:** P0 | **Source:** US-006, FR-036, FR-037, EH-002
- **Pre-condition:** Ticket service down
- **Steps:**
  1. Search identifier
  2. Verify Percakapan results normal
  3. Verify Tiket shows 'Coba lagi'
  4. Click retry
- **Expected Result:** Partial success preserved; retry for failed domain
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-017 — Both fail → 'Gagal memuat hasil pencarian. Coba lagi.'
- **Type:** Negative | **Priority:** P0 | **Source:** EH-004
- **Pre-condition:** Both services erroring
- **Steps:**
  1. Search keyword
  2. Verify popup stays open
  3. Verify error message with retry
- **Expected Result:** Full error state with retry
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-018 — 'AWB1234' matches same as 'AWB-1234' (normalization)
- **Type:** Edge | **Priority:** P0 | **Source:** FR-011–FR-013, EC-003
- **Pre-condition:** Record has 'AWB-1234'
- **Steps:**
  1. Search 'AWB1234'
  2. Verify same record found
- **Expected Result:** Normalization handles separators/case
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-019 — Exact matches rank above weaker; ties by recency
- **Type:** Positive | **Priority:** P0 | **Source:** FR-031–FR-033
- **Pre-condition:** Multiple records with varying confidence
- **Steps:**
  1. Search identifier with primary+secondary matches
  2. Verify ranking order
- **Expected Result:** Exact > fallback; ties by recency
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-GSEARCH-020 — Phase 1 search does NOT mutate data or auto-create tags
- **Type:** Regression | **Priority:** P0 | **Source:** FR-014–FR-016
- **Pre-condition:** Records with known state
- **Steps:**
  1. Note state before search
  2. Search and open results
  3. Verify no tags created, no state changed
- **Expected Result:** Zero mutation from search
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## 2. PRD - Actionable Shared Attribute Search and System Relation Labels
- **Status:** UNKNOWN — verify
- **Surface:** Search popup + per-domain checkbox selection + bulk action bar + relation label chips
- **Relation to Conversation:** Extends shared-attribute discovery into actionable bulk labeling and click-through navigation
- **Requirement IDs:** US-001–US-007, FR-001–FR-029, EH-001–EH-006, EC-001–EC-005
> (Status: UNKNOWN — verify against FE/BE implementation)

### SC-SHAREATTR-001 — Clicking Conversation result opens Room with Detail and closes popup
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-003
- **Pre-condition:** Popup with conversation results
- **Steps:**
  1. Press Ctrl+K, search shared attribute
  2. Click Conversation result row
  3. Verify popup closes
  4. Verify `[data-cy='Chat-Room-Container']` opens with Detail panel `[data-cy='Chat-Detail-Section-assignee']` visible
- **Expected Result:** Room opens with Detail; popup closes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-002 — Clicking Ticket result opens Ticket Detail and closes popup
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-002, FR-003
- **Pre-condition:** Popup with ticket results
- **Steps:**
  1. Press Ctrl+K, search shared attribute
  2. Click Ticket result
  3. Verify popup closes
  4. Verify Ticket Detail loads
- **Expected Result:** Ticket Detail opens; popup closes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-003 — Checkbox selection shows Conversation bulk action bar
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-005, FR-008, FR-010
- **Pre-condition:** Multiple conversation results
- **Steps:**
  1. Press Ctrl+K, search shared attribute
  2. Check 2+ Conversation results via `[data-cy='chat-list-N-checkbox']`
  3. Verify Conversation bulk action bar with selected count
- **Expected Result:** Bulk bar for Conversations
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-004 — Checkbox selection shows Ticket bulk action bar separately
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-005, FR-008, FR-011
- **Pre-condition:** Multiple ticket results
- **Steps:**
  1. Press Ctrl+K, search shared attribute
  2. Check 2+ Ticket results
  3. Verify separate Ticket bulk bar
- **Expected Result:** Separate Ticket bulk bar
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-005 — Selecting both → two separate domain action bars; no mixed execution
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, FR-006–FR-007, EH-004
- **Pre-condition:** Both Conversation and Ticket results
- **Steps:**
  1. Select Conversation results → verify Conversation bulk bar
  2. Select Ticket results → verify separate Ticket bulk bar
  3. Verify NO mixed-domain action option
- **Expected Result:** Two separate bars; no mixed execution
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-006 — 'Beri Tag Relasi Otomatis' applies system relation label
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-012
- **Pre-condition:** Results selected in one domain
- **Steps:**
  1. Select results in one domain
  2. Click 'Beri Tag Relasi Otomatis'
  3. Verify relation label applied to each selected record
- **Expected Result:** Relation labels applied
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-007 — Applying same label again → idempotent, no duplicate
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-015, FR-021, EH-002
- **Pre-condition:** Record already has relation label
- **Steps:**
  1. Select record with existing label
  2. Apply same label again
  3. Verify no duplicate chip
- **Expected Result:** Idempotent; no duplicates
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-008 — Label displays readable format: 'AWB • JNE123456789'
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-019
- **Pre-condition:** Relation label applied
- **Steps:**
  1. Apply label for AWB='JNE123456789'
  2. Open record detail
  3. Verify label shows 'AWB • JNE123456789'
- **Expected Result:** Readable format with attribute + value
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-009 — Relation labels stored separately from manual tag registry
- **Type:** Positive | **Priority:** P0 | **Source:** FR-016, FR-022, US-007
- **Pre-condition:** Relation label applied
- **Steps:**
  1. Apply relation label
  2. Navigate to Settings → Tag Management
  3. Verify relation label NOT in manual tag list
- **Expected Result:** Separate from manual tags
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-010 — Relation label chip distinct visual style from manual tag chip
- **Type:** Positive | **Priority:** P0 | **Source:** FR-022
- **Pre-condition:** Record has both tag types
- **Steps:**
  1. Open record with manual tag and relation label
  2. Verify visual distinction between chips
- **Expected Result:** Distinct visual styles
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-011 — Relation filter shortcut narrows to that value
- **Type:** Positive | **Priority:** P1 | **Source:** US-006, FR-023
- **Pre-condition:** Relation label visible
- **Steps:**
  1. Click relation filter shortcut on chip
  2. Verify surface narrows to that value
- **Expected Result:** Filter narrows results
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-012 — No matches under relation filter → clear empty state
- **Type:** State | **Priority:** P1 | **Source:** US-006
- **Pre-condition:** Filter returns zero results
- **Steps:**
  1. Apply relation filter with no matches
  2. Verify empty state
- **Expected Result:** Empty state shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-013 — Zero selected → bulk action button disabled
- **Type:** Negative | **Priority:** P0 | **Source:** EH-003
- **Pre-condition:** No results selected
- **Steps:**
  1. Open search with results
  2. Verify bulk button disabled
  3. Select one → verify enabled
- **Expected Result:** Disabled without selection
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-014 — Partial failure → 'Sebagian label berhasil diterapkan.'
- **Type:** Negative | **Priority:** P0 | **Source:** EH-005, FR-013–FR-014
- **Pre-condition:** Some records inaccessible
- **Steps:**
  1. Select mix of accessible/inaccessible records
  2. Apply bulk label
  3. Verify 'Sebagian label berhasil diterapkan.'
- **Expected Result:** Partial success message
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-015 — Inaccessible records skipped with audit; never mutated silently
- **Type:** Permission | **Priority:** P0 | **Source:** FR-013–FR-014, EH-001
- **Pre-condition:** Out-of-scope records in selection
- **Steps:**
  1. Select records including out-of-scope
  2. Execute bulk apply
  3. Verify skipped with audit log
- **Expected Result:** Audit-logged skip
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-016 — Changing keyword clears previous selection
- **Type:** Edge | **Priority:** P0 | **Source:** FR-009, EC-005
- **Pre-condition:** Selection made then keyword changed
- **Steps:**
  1. Select 3 results
  2. Change search keyword
  3. Verify selections cleared
- **Expected Result:** Selection reset on keyword change
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-017 — Auto Tag rules NOT changed by this feature
- **Type:** Regression | **Priority:** P0 | **Source:** FR-026, US-007
- **Pre-condition:** Auto Tag rules exist
- **Steps:**
  1. Note Auto Tag rules
  2. Apply relation labels
  3. Verify rules unchanged
- **Expected Result:** Auto Tag rules unaffected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHAREATTR-018 — Long values (50+ chars) truncated safely with full value on hover
- **Type:** Edge | **Priority:** P1 | **Source:** EC-003
- **Pre-condition:** Long attribute value
- **Steps:**
  1. Apply label with 50+ char value
  2. Verify chip truncated
  3. Hover to verify full value
- **Expected Result:** Truncated chip; full value on hover
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## 3. PRD - Omnichannel Inbox - Shopee Channel Add-On
- **Status:** UNKNOWN — verify
- **Surface:** Settings → Add-On → Shopee + Inbox chat list + Conversation Room
- **Relation to Conversation:** Adds Shopee as a new channel producing conversations in the unified inbox, following existing conversation lifecycle
- **Requirement IDs:** US-001–US-007, FR-001–FR-057, EH-001–EH-014, EC-001–EC-010
> (Status: UNKNOWN — verify against FE/BE implementation)

### SC-SHOPEE-001 — Admin activates Shopee add-on and completes connect flow
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001–FR-004
- **Pre-condition:** Admin with settings access
- **Steps:**
  1. Navigate to Settings → Add-On → Shopee
  2. Click 'Hubungkan akun Shopee'
  3. Complete OAuth flow with valid credentials
  4. Verify account channel shows 'terhubung'
- **Expected Result:** Account channel created in correct tenant
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-002 — Invalid credentials → no account channel, safe failure
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-002
- **Pre-condition:** Admin on connect flow
- **Steps:**
  1. Enter invalid Shopee credentials
  2. Verify 'Gagal menghubungkan akun Shopee'
  3. Verify no active account channel created
- **Expected Result:** Safe failure; no account created
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-003 — Settings shows 'terhubung' after successful connection
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-009
- **Pre-condition:** Shopee connected
- **Steps:**
  1. Navigate to Settings → Add-On → Shopee
  2. Verify status 'terhubung'
  3. Verify shop name displayed
- **Expected Result:** Connected status shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-004 — Valid inbound webhook creates/updates conversation in inbox
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-015, FR-022–FR-024
- **Pre-condition:** Shopee connected; buyer sends message
- **Steps:**
  1. Trigger valid inbound webhook
  2. Navigate to `[data-cy='/id/conversation/your-inbox']`
  3. Verify Shopee conversation in `[data-cy='conversation-list']` with `[data-cy='chat-list-N-channel-icon']`
- **Expected Result:** New Shopee conversation in inbox
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-005 — Same buyer continuation → message appended to existing conversation
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-024
- **Pre-condition:** Existing Shopee conversation
- **Steps:**
  1. Trigger second webhook from same buyer/thread
  2. Verify message appended to `[data-cy='Messages-Container']`
- **Expected Result:** Appended to existing; no duplicate
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-006 — Duplicate webhook retry → idempotent, no duplicates
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-056–FR-057, EC-001
- **Pre-condition:** Known event/message ID
- **Steps:**
  1. Replay same webhook payload
  2. Verify no duplicate conversation or message
- **Expected Result:** Idempotent; no duplicates
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-007 — Invalid webhook → rejected, no mutation, security log
- **Type:** Negative | **Priority:** P0 | **Source:** FR-012–FR-014, EH-003
- **Pre-condition:** Tampered webhook signature
- **Steps:**
  1. Send webhook with invalid signature
  2. Verify rejected
  3. Verify no data created
  4. Verify security audit log
- **Expected Result:** Rejected; no mutation; audit logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-008 — Agent sends outbound text reply to Shopee
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-032–FR-035
- **Pre-condition:** Shopee conversation open
- **Steps:**
  1. Open Shopee room
  2. Type in `[data-cy='Message-Text-Input']`
  3. Click `[data-cy='Send-Button']`
  4. Verify message in `[data-cy='Messages-Container']`
  5. Verify delivery to Shopee
- **Expected Result:** Sent and stored in timeline
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-009 — Outbound fails → 'Pesan gagal dikirim ke Shopee'
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-009, FR-035
- **Pre-condition:** Provider returns failure
- **Steps:**
  1. Send to failing Shopee conversation
  2. Verify message marked failed
  3. Verify error message shown
- **Expected Result:** Marked failed with clear error
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-010 — Agent without send permission → composer disabled
- **Type:** Permission | **Priority:** P0 | **Source:** US-003, FR-050–FR-051, EH-011
- **Pre-condition:** Agent without send permission
- **Steps:**
  1. Open Shopee room as no-permission agent
  2. Verify `[data-cy='Input-Area-Container']` disabled/hidden
- **Expected Result:** Composer disabled; server-side enforced
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-011 — Account disconnected → composer blocked with 'Akun Shopee tidak terhubung'
- **Type:** Negative | **Priority:** P0 | **Source:** EH-007, FR-036
- **Pre-condition:** Account disconnected mid-session
- **Steps:**
  1. Disconnect account from settings
  2. Open Shopee room
  3. Verify composer blocked
- **Expected Result:** Blocked with disconnect message
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-012 — Shopee conversations show 'Shopee' channel label
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-042
- **Pre-condition:** Shopee conversations exist
- **Steps:**
  1. Navigate to inbox
  2. Verify `[data-cy='chat-list-N-channel-icon']` shows Shopee label
- **Expected Result:** Shopee label visible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-013 — Channel filter includes Shopee; filtering works
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-043–FR-044
- **Pre-condition:** Multi-channel conversations exist
- **Steps:**
  1. Click `[data-cy='chatList-filter-status']`
  2. Select 'Shopee'
  3. Verify only Shopee conversations
- **Expected Result:** Filter narrows to Shopee
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-014 — Shopee in platform-level analytics
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-054
- **Pre-condition:** Shopee data exists
- **Steps:**
  1. Navigate to Analitik → Percakapan
  2. Verify Shopee in channel distribution
  3. Verify Shopee counted in KPIs
- **Expected Result:** Included in analytics
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-015 — Auth expiry → auto-disconnect, outbound blocked, audit logged
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-011, EH-002
- **Pre-condition:** Shopee connected
- **Steps:**
  1. Simulate auth expiry
  2. Verify auto-disconnect
  3. Verify outbound blocked
  4. Verify 'shopee_account_invalidated' audit
- **Expected Result:** Auto-disconnect with audit
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-016 — Reconnect → status restored, outbound works again
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-010
- **Pre-condition:** Account disconnected
- **Steps:**
  1. Click 'Hubungkan ulang'
  2. Complete re-auth
  3. Verify status restored
  4. Verify outbound works
- **Expected Result:** Reconnect restores all
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-017 — Buyer identity via channel-scoped external ID, not display name
- **Type:** Positive | **Priority:** P0 | **Source:** FR-018–FR-021, EH-005
- **Pre-condition:** Shopee inbound
- **Steps:**
  1. Receive message from buyer
  2. Verify contact resolved by referenceId not display name
- **Expected Result:** External ID-based identity
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-018 — Closed thread → canonical reopen/create policy
- **Type:** Edge | **Priority:** P0 | **Source:** EC-004, FR-026
- **Pre-condition:** Conversation previously closed
- **Steps:**
  1. Close conversation
  2. Trigger inbound from same thread
  3. Verify canonical policy followed
  4. Verify open/closed only (no Shopee-specific states)
- **Expected Result:** Canonical reopen; no custom states
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-019 — Unsupported non-text inbound → text pipeline unaffected; logged
- **Type:** Edge | **Priority:** P0 | **Source:** FR-029–FR-031, EH-012, EC-009
- **Pre-condition:** Unsupported message type arrives
- **Steps:**
  1. Trigger unsupported type inbound
  2. Verify text pipeline unaffected
  3. Verify event logged
- **Expected Result:** Text pipeline intact; logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-020 — Double-click send → idempotency guard prevents double-send
- **Type:** Edge | **Priority:** P0 | **Source:** EC-006
- **Pre-condition:** Agent double-clicks send
- **Steps:**
  1. Rapidly double-click `[data-cy='Send-Button']`
  2. Verify only one message sent
- **Expected Result:** Single send despite double-click
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-021 — Out-of-order status callbacks → deterministic reconciliation
- **Type:** Edge | **Priority:** P0 | **Source:** FR-041, EC-005
- **Pre-condition:** Out-of-order callbacks
- **Steps:**
  1. Send message
  2. Deliver callbacks in reverse order
  3. Verify final state correct
  4. Verify no regression
- **Expected Result:** Deterministic; no regression
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-022 — Multiple Shopee shops → each separate account channel
- **Type:** Positive | **Priority:** P1 | **Source:** FR-008, EC-002
- **Pre-condition:** Tenant with multiple shops
- **Steps:**
  1. Connect shop 1 → verify account channel
  2. Connect shop 2 → verify separate channel
  3. Verify distinguishable by name
- **Expected Result:** Each shop = separate account channel
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-023 — All events audited with actor, tenant, account channel, timestamp
- **Type:** Positive | **Priority:** P1 | **Source:** US-006, FR-052–FR-053
- **Pre-condition:** Shopee operations performed
- **Steps:**
  1. Perform connect, inbound, outbound, disconnect
  2. Check audit log
  3. Verify all required fields present
- **Expected Result:** Full audit trail
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-024 — Uses existing Platform → Channel → AccountChannel model
- **Type:** Contract | **Priority:** P0 | **Source:** US-007, FR-003, FR-048
- **Pre-condition:** Shopee connected
- **Steps:**
  1. Verify platform 'shopee' registered
  2. Verify Channel under Platform
  3. Verify AccountChannel bound to tenant
  4. Verify no new entity model
- **Expected Result:** Standard model used
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SHOPEE-025 — Existing channels continue working without regression
- **Type:** Regression | **Priority:** P0 | **Source:** FR-056–FR-057
- **Pre-condition:** Shopee active alongside existing channels
- **Steps:**
  1. Verify WhatsApp API works
  2. Verify Instagram works
  3. Verify Live Chat, Email, Messenger functional
  4. Verify channel filter for all channels
- **Expected Result:** Zero regression on existing channels
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## 4. PRD Ticket - Live Chat Transcript Reply via Email and Auto Linked Conversation
- **Status:** DEVELOPED
- **Surface:** Transcript email (sent to customer) + inbound Email conversation creation + grouped room with Primary/Child tabs
- **Relation to Conversation:** Enables Live Chat → Email channel continuity; Email reply creates new conversation linked to original Live Chat
- **Requirement IDs:** US-001–US-009, FR-001–FR-056, EH-001–EH-014, EC-001–EC-014

### SC-TRANSCRIPT-001 — Live Chat resolved → transcript email sent from workspace default email
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-006–FR-007
- **Pre-condition:** Live Chat conversation with customer email; workspace default email connected
- **Steps:**
  1. Resolve a Live Chat conversation with customer email present
  2. Check outbound email queue for transcript email
  3. Verify From and Reply-To use workspace default email account
  4. Verify email contains transcript summary and body
- **Expected Result:** Transcript email sent from workspace default email
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-002 — Live Chat inactivity timeout → transcript email sent
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-002
- **Pre-condition:** Live Chat with customer email reaches inactivity timeout
- **Steps:**
  1. Wait for Live Chat inactivity timeout to trigger
  2. Verify transcript email sent to customer email
- **Expected Result:** Transcript sent on timeout
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-003 — Resolved + timeout both fire → only one transcript sent
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-003, EC-001
- **Pre-condition:** Live Chat resolves then timeout also fires
- **Steps:**
  1. Resolve Live Chat, then trigger timeout for same conversation
  2. Verify only ONE transcript email sent (check email_logs for duplicate)
- **Expected Result:** Single transcript; no duplicate
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-004 — Customer email missing → no send, skipped audit event
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-003
- **Pre-condition:** Live Chat resolved but no customer email
- **Steps:**
  1. Resolve Live Chat without customer email
  2. Verify no transcript email sent
  3. Verify skipped audit event recorded
- **Expected Result:** No send; audit logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-005 — Workspace default email not connected → 'Email default workspace belum terhubung'
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-001
- **Pre-condition:** No workspace default email connected
- **Steps:**
  1. Resolve Live Chat with no default email configured
  2. Verify transcript send blocked
  3. Verify 'Email default workspace belum terhubung' in audit/UI
- **Expected Result:** Blocked with clear message
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-006 — Workspace default email inactive → blocked with audit reason
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-002
- **Pre-condition:** Default email account inactive
- **Steps:**
  1. Resolve Live Chat with inactive default email
  2. Verify send blocked
  3. Verify inactive reason in audit
- **Expected Result:** Blocked; reason audited
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-007 — Send failure → retry up to 3x, then 'failed' with audit
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-005, EH-004
- **Pre-condition:** Email send fails (provider error)
- **Steps:**
  1. Trigger transcript send that fails
  2. Verify retry attempts up to 3
  3. Verify final status 'failed'
  4. Verify audit event
- **Expected Result:** Retry 3x then failed status
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-008 — Customer replies to transcript → new Email conversation created
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-022
- **Pre-condition:** Customer received transcript email
- **Steps:**
  1. Customer replies to transcript email
  2. Verify new open Email conversation created in inbox
  3. Verify channel is Email
- **Expected Result:** Email conversation created from reply
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-009 — Reply with valid transcript reference → auto-linked to original Live Chat
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-028
- **Pre-condition:** Reply includes valid transcript reference
- **Steps:**
  1. Customer replies with transcript reference intact
  2. Verify Email conversation auto-linked to original Live Chat
- **Expected Result:** Auto-linked via transcript reference
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-010 — Reply without valid reference → no auto-link, suggested link only
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-019–FR-021, EH-006
- **Pre-condition:** Reply has no valid transcript reference
- **Steps:**
  1. Customer replies with stripped/invalid reference
  2. Verify Email conversation NOT auto-linked
  3. Verify suggested link if safe candidate exists
- **Expected Result:** No auto-link; suggestion only
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-011 — Multiple replies in same thread → appended to same Email conversation
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-023, EC-002
- **Pre-condition:** Customer sends multiple replies
- **Steps:**
  1. Customer sends reply 1 → verify Email conversation created
  2. Customer sends reply 2 in same thread → verify appended
  3. Verify no duplicate conversation
- **Expected Result:** Single Email conversation; messages appended
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-012 — Email promoted to Primary, Live Chat demoted to Child
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-034–FR-035
- **Pre-condition:** Email conversation linked to Live Chat
- **Steps:**
  1. After auto-link succeeds
  2. Verify Email conversation is Primary
  3. Verify Live Chat is Child in grouped room
- **Expected Result:** Email = Primary; Live Chat = Child
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-013 — Primary promotion fails → group stays linked, error shown
- **Type:** Negative | **Priority:** P0 | **Source:** US-005, EH-008
- **Pre-condition:** Linking succeeds but Primary promotion fails
- **Steps:**
  1. Trigger scenario where Primary promotion fails
  2. Verify group stays linked
  3. Verify 'Gagal menjadikan email sebagai percakapan utama'
- **Expected Result:** Linked but promotion failed; error shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-014 — Original Live Chat shows system message: 'Pelanggan melanjutkan percakapan melalui email...'
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-038–FR-039
- **Pre-condition:** Customer replied by Email
- **Steps:**
  1. Open original Live Chat room
  2. Verify system message: 'Pelanggan melanjutkan percakapan melalui email. Silakan balas di Email.'
- **Expected Result:** System message in Live Chat room
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-015 — System message link → grouped room opens with Email tab active
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-040
- **Pre-condition:** System message visible in Live Chat
- **Steps:**
  1. Click link in system message
  2. Verify grouped room opens
  3. Verify Email tab active by default
- **Expected Result:** Email tab active on click
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-016 — Grouped room: Email tab first as Primary, Live Chat tab as Child
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-030–FR-031
- **Pre-condition:** Linked Email + Live Chat conversation
- **Steps:**
  1. Open grouped row
  2. Verify Email tab first (Primary)
  3. Switch to Live Chat tab → verify history visible
  4. Verify `[data-cy='Chat-Detail-Title']` shows grouped state
- **Expected Result:** Email first; Live Chat as Child with history
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-017 — Email tab unread count included in parent row unread count
- **Type:** Positive | **Priority:** P0 | **Source:** US-007
- **Pre-condition:** Email tab has unread messages
- **Steps:**
  1. Receive Email reply
  2. Verify parent row `[data-cy='chat-list-N-unread-count']` includes Email unread
- **Expected Result:** Unread count aggregated across tabs
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-018 — Live Chat stays resolved after Email reply; NOT reopened
- **Type:** Positive | **Priority:** P0 | **Source:** FR-041–FR-042
- **Pre-condition:** Email reply received for resolved Live Chat
- **Steps:**
  1. Customer replies by Email
  2. Verify original Live Chat still resolved
  3. Verify NOT reopened
- **Expected Result:** Live Chat remains resolved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-019 — Email SLA starts per Email channel rules; Live Chat SLA NOT restarted
- **Type:** Positive | **Priority:** P0 | **Source:** FR-043–FR-045
- **Pre-condition:** Email conversation created
- **Steps:**
  1. Verify Email SLA cycle started based on Email channel config
  2. Verify Live Chat SLA NOT restarted
- **Expected Result:** Email SLA active; Live Chat SLA unchanged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-020 — User without Email send permission → composer disabled
- **Type:** Permission | **Priority:** P0 | **Source:** FR-050, EH-011
- **Pre-condition:** User lacks Email send permission
- **Steps:**
  1. Open grouped room with Email tab as no-permission user
  2. Verify composer disabled
  3. Verify 'Anda tidak memiliki akses untuk membalas email'
- **Expected Result:** Composer disabled; permission message
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-021 — User without linking permission → link actions hidden
- **Type:** Permission | **Priority:** P0 | **Source:** FR-049
- **Pre-condition:** User lacks linking permission
- **Steps:**
  1. Open conversation detail as no-linking-permission user
  2. Verify link/unlink actions hidden/disabled
- **Expected Result:** Link actions hidden
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-022 — All lifecycle events audited (send, reply, link, Primary change, system message)
- **Type:** Positive | **Priority:** P1 | **Source:** US-008, FR-051–FR-056
- **Pre-condition:** Full transcript-reply lifecycle executed
- **Steps:**
  1. Perform complete lifecycle: send → reply → link → Primary change → system message
  2. Check audit log for each event
  3. Verify actor, timestamp, source/target conversation IDs
- **Expected Result:** All events audited
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-023 — Default email changed after send → old replies still matched
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, EC-005
- **Pre-condition:** Default email changed post-send
- **Steps:**
  1. Change workspace default email after transcript sent
  2. Customer replies to old transcript
  3. Verify reply still matched via transcript reference
- **Expected Result:** Old replies still matched
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-TRANSCRIPT-024 — Customer forwards transcript → third party reply creates Email conversation
- **Type:** Edge | **Priority:** P1 | **Source:** EC-004
- **Pre-condition:** Customer forwards transcript email
- **Steps:**
  1. Customer forwards transcript to another person
  2. That person replies
  3. Verify Email conversation created
  4. Verify auto-link only if transcript reference valid
- **Expected Result:** New conversation from forwarder; conditional auto-link
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## 5. PRD Inbox Conversation - reply via email
- **Status:** ADJACENT
- **Surface:** Transcript email + Email conversation + grouped room
- **Relation to Conversation:** Enables Live Chat → Email reply continuity with auto-linked grouped conversation
- **Requirement IDs:** US-001–US-009, FR-001–FR-056, EH-001–EH-014, EC-001–EC-014
> (Status: ADJACENT — from neighboring domain)

> **Overlap note:** This PRD is a near-exact duplicate of PRD #4 (same feature name, same v1.0 date 2026-04-29, same FR/US/EH/EC content). Only difference: Design Lead is 'Sabrina' in #5 vs 'Resky' in #4. Scenarios enriched independently for completeness; de-dup at test-case level recommended.

### SC-EMAILREPLY-001 — Live Chat resolved → transcript email sent from workspace default email
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-006–FR-007
- **Pre-condition:** Live Chat with customer email; default email connected
- **Steps:**
  1. Resolve Live Chat conversation
  2. Verify transcript email sent from workspace default email
  3. Verify From and Reply-To match default account
- **Expected Result:** Transcript sent from default email
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-002 — Live Chat inactivity timeout → transcript email sent
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-002
- **Pre-condition:** Inactivity timeout reached
- **Steps:**
  1. Wait for timeout trigger
  2. Verify transcript email sent
- **Expected Result:** Sent on timeout
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-003 — Resolved + timeout both fire → only one email sent
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-003, EC-001
- **Pre-condition:** Both triggers for same conversation
- **Steps:**
  1. Resolve then timeout for same conversation
  2. Verify single transcript email
- **Expected Result:** No duplicate email
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-004 — Customer email missing → no send, skipped audit
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-003
- **Pre-condition:** No customer email on file
- **Steps:**
  1. Resolve Live Chat without email
  2. Verify no send
  3. Verify skipped audit
- **Expected Result:** No send; audit logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-005 — Workspace default email not connected → 'Email default workspace belum terhubung'
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-001
- **Pre-condition:** No default email configured
- **Steps:**
  1. Resolve with no default email
  2. Verify blocked
  3. Verify message
- **Expected Result:** Blocked with message
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-006 — Workspace default email inactive → blocked, audit stores reason
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-002
- **Pre-condition:** Default email inactive
- **Steps:**
  1. Resolve with inactive default email
  2. Verify blocked with audit reason
- **Expected Result:** Blocked; reason audited
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-007 — Send failure → retry 3x, then 'failed'
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-005, EH-004
- **Pre-condition:** Send fails
- **Steps:**
  1. Trigger failing send
  2. Verify 3 retries
  3. Verify final 'failed' status
- **Expected Result:** Retried then failed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-008 — Customer replies → new Email conversation created
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-022
- **Pre-condition:** Customer received transcript
- **Steps:**
  1. Customer replies to transcript
  2. Verify new Email conversation in inbox
- **Expected Result:** Email conversation created
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-009 — Valid transcript reference → auto-linked to original Live Chat
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-028
- **Pre-condition:** Reply has valid reference
- **Steps:**
  1. Reply with valid reference
  2. Verify auto-linked to Live Chat
- **Expected Result:** Auto-linked
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-010 — No valid reference → no auto-link, suggestion only if safe candidate
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-019–FR-021, EH-006
- **Pre-condition:** Reply has no valid reference
- **Steps:**
  1. Reply with stripped reference
  2. Verify no auto-link
  3. Verify suggestion if safe candidate
- **Expected Result:** No auto-link; suggestion only
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-011 — Multiple replies in same thread → appended to existing Email conversation
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-023, EC-002
- **Pre-condition:** Multiple replies sent
- **Steps:**
  1. Send reply 1 → verify conversation created
  2. Send reply 2 same thread → verify appended
  3. Verify no duplicate
- **Expected Result:** Appended; no duplicate
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-012 — Linking succeeds → Email becomes Primary, Live Chat becomes Child
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-034–FR-035
- **Pre-condition:** Link succeeds
- **Steps:**
  1. After link succeeds
  2. Verify Email = Primary
  3. Verify Live Chat = Child
- **Expected Result:** Email Primary; Live Chat Child
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-013 — Primary promotion fails → group stays linked, error shown
- **Type:** Negative | **Priority:** P0 | **Source:** US-005, EH-008
- **Pre-condition:** Promotion fails
- **Steps:**
  1. Trigger promotion failure
  2. Verify group linked
  3. Verify error message
- **Expected Result:** Linked; promotion failed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-014 — Live Chat shows system message directing agent to Email
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-038–FR-039
- **Pre-condition:** Email reply received
- **Steps:**
  1. Open Live Chat room
  2. Verify system message: 'Pelanggan melanjutkan percakapan melalui email...'
- **Expected Result:** System message directs to Email
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-015 — Grouped room opens with Email tab active by default
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-030–FR-036
- **Pre-condition:** Linked conversations exist
- **Steps:**
  1. Open grouped room
  2. Verify Email tab active first
- **Expected Result:** Email tab active by default
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-016 — Email unread count reflected in parent row
- **Type:** Positive | **Priority:** P0 | **Source:** US-007
- **Pre-condition:** Email has unread messages
- **Steps:**
  1. Verify parent row unread includes Email unread
- **Expected Result:** Unread count aggregated
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-017 — Live Chat remains resolved after Email reply
- **Type:** Positive | **Priority:** P0 | **Source:** FR-041–FR-042
- **Pre-condition:** Email reply received
- **Steps:**
  1. Verify Live Chat still resolved after Email reply
- **Expected Result:** Not reopened
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-018 — Email SLA starts per Email channel rules; Live Chat SLA not restarted
- **Type:** Positive | **Priority:** P0 | **Source:** FR-043–FR-045
- **Pre-condition:** Email conversation created
- **Steps:**
  1. Verify Email SLA started
  2. Verify Live Chat SLA unchanged
- **Expected Result:** Email SLA active; Live Chat unchanged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-019 — No Email send permission → composer disabled
- **Type:** Permission | **Priority:** P0 | **Source:** FR-050, EH-011
- **Pre-condition:** User lacks send permission
- **Steps:**
  1. Open Email tab as no-permission user
  2. Verify composer disabled
- **Expected Result:** Disabled composer
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-020 — No linking permission → link actions hidden
- **Type:** Permission | **Priority:** P0 | **Source:** FR-049
- **Pre-condition:** User lacks linking permission
- **Steps:**
  1. Open detail as no-link user
  2. Verify link actions hidden
- **Expected Result:** Hidden link actions
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-021 — All transcript-reply lifecycle events audited
- **Type:** Positive | **Priority:** P1 | **Source:** US-008, FR-051–FR-056
- **Pre-condition:** Full lifecycle executed
- **Steps:**
  1. Perform full lifecycle
  2. Check audit for send, reply, link, Primary change, system message
- **Expected Result:** All events audited
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-022 — Default email changed after send → old replies still matched
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, EC-005
- **Pre-condition:** Default email changed post-send
- **Steps:**
  1. Change default email
  2. Customer replies to old transcript
  3. Verify still matched
- **Expected Result:** Old replies matched
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-023 — Auto-link failure → Email stays open, unlinked; retry up to 3x
- **Type:** Negative | **Priority:** P0 | **Source:** US-009, EH-007
- **Pre-condition:** Auto-link fails
- **Steps:**
  1. Trigger auto-link failure
  2. Verify Email conversation stays open unlinked
  3. Verify retry up to 3 times
- **Expected Result:** Open and unlinked; retry attempted
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-EMAILREPLY-024 — Duplicate inbound email → deduplicated by identity and thread reference
- **Type:** Edge | **Priority:** P0 | **Source:** EC-014
- **Pre-condition:** Duplicate email delivery
- **Steps:**
  1. Receive same email twice (delivery duplication)
  2. Verify single message in conversation
  3. Verify deduplication by identity+thread
- **Expected Result:** Deduplicated; no duplicate message
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## 6. PRD Widget - email transcript
- **Status:** ADJACENT
- **Surface:** Widget settings → Appearance tab toggle + branded transcript email + public transcript page + continue-chat link
- **Relation to Conversation:** Sends transcript email copy of Live Chat conversation to customer; provides public transcript link and continue-chat resume
- **Requirement IDs:** US-001–US-005, FR-001–FR-041, EH-001–EH-005, EC-001–EC-012
> (Status: ADJACENT — from neighboring domain)

> **Overlap note:** This PRD shares trigger logic (inactivity timeout, resolved) with PRD #4 but covers a different surface (widget settings + branded email + public transcript). Enriched independently.

### SC-WIDGETEMAIL-001 — Admin toggles 'Kirim transkrip ke email pelanggan' ON in widget Appearance tab
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001–FR-002
- **Pre-condition:** Admin with channel manage permission
- **Steps:**
  1. Navigate to settings/channels/widget?tab=appearance
  2. Toggle 'Kirim transkrip ke email pelanggan' to ON
  3. Click 'Simpan & Aktifkan'
  4. Verify setting saved per tenant
- **Expected Result:** Toggle saved per tenant
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-002 — Toggle OFF → no transcript email sent when Live Chat ends
- **Type:** Positive | **Priority:** P0 | **Source:** US-001
- **Pre-condition:** Toggle is OFF
- **Steps:**
  1. Keep toggle OFF
  2. End a Live Chat conversation
  3. Verify no transcript email sent
- **Expected Result:** No email when toggle off
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-003 — Admin without permission → 'Akses ditolak', toggle not editable
- **Type:** Permission | **Priority:** P0 | **Source:** US-001, FR-003
- **Pre-condition:** Admin without channel manage permission
- **Steps:**
  1. Navigate to widget settings as no-permission user
  2. Verify 'Akses ditolak'
  3. Verify toggle not editable
- **Expected Result:** Access denied; toggle locked
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-004 — Inactivity timeout (20 min) + valid email → exactly 1 transcript sent
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-010, FR-012, FR-015
- **Pre-condition:** Toggle ON; customer email exists; 20 min inactivity
- **Steps:**
  1. Wait for 20 min inactivity timeout
  2. Verify exactly 1 transcript email sent
- **Expected Result:** Single transcript on timeout
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-005 — Conversation resolved without timeout → transcript sent as fallback
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-011
- **Pre-condition:** Conversation resolved before timeout
- **Steps:**
  1. Resolve conversation
  2. Verify transcript email sent as fallback
- **Expected Result:** Sent on resolved fallback
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-006 — Customer email missing → no send, skipped reason stored
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, EH-002, FR-009
- **Pre-condition:** No customer email
- **Steps:**
  1. End conversation without customer email
  2. Verify no send
  3. Verify skipped reason stored
- **Expected Result:** No send; reason stored
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-007 — Email header shows widget logo; falls back to tenant name if missing
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-021
- **Pre-condition:** Widget logo configured
- **Steps:**
  1. Send transcript with logo configured
  2. Verify email header shows widget logo
  3. Remove logo → send again → verify tenant name fallback
- **Expected Result:** Logo shown; tenant name fallback
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-008 — Email uses widget theme color for header accent and CTA buttons
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-022
- **Pre-condition:** Widget theme color configured
- **Steps:**
  1. Send transcript
  2. Verify email uses theme color for header accent and CTA buttons
- **Expected Result:** Theme color applied to email
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-009 — Transcript exceeds limits → truncated to last 100 messages, secure link included
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-024–FR-026
- **Pre-condition:** Very long transcript (>120K chars or >300 msgs)
- **Steps:**
  1. Trigger transcript for very long conversation
  2. Verify 'Transkrip dipotong' notice
  3. Verify only last 100 messages shown
  4. Verify secure link still included
- **Expected Result:** Truncated with notice; link included
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-010 — Secure link expires after 30 days → 'Link transkrip tidak valid atau sudah kedaluwarsa'
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-028, EH-004
- **Pre-condition:** Transcript link token expired
- **Steps:**
  1. Open transcript link after 30+ days
  2. Verify 'Link transkrip tidak valid atau sudah kedaluwarsa'
- **Expected Result:** Expired link shows clear message
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-011 — Public transcript page shows brand, metadata, full transcript; no internal UI
- **Type:** Positive | **Priority:** P0 | **Source:** FR-029–FR-031
- **Pre-condition:** Valid transcript link
- **Steps:**
  1. Open public transcript link
  2. Verify tenant brand header shown
  3. Verify conversation metadata shown
  4. Verify full transcript shown
  5. Verify NO internal inbox UI exposed
- **Expected Result:** Public page with brand + transcript; no internal UI
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-012 — 'Lanjutkan Chat' button opens continue_chat_url with resume token
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-034–FR-035
- **Pre-condition:** Continue Chat enabled and URL configured
- **Steps:**
  1. Click 'Lanjutkan Chat' in transcript email
  2. Verify opens continue_chat_url
  3. Verify widget auto-opens with `si_open_livechat=1`
- **Expected Result:** Continue Chat opens widget
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-013 — Resume token valid → same conversation thread shown (history visible)
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-036
- **Pre-condition:** Valid resume token
- **Steps:**
  1. Click Continue Chat with valid resume token
  2. Verify same conversation thread loaded
  3. Verify message history visible
- **Expected Result:** Same thread with history
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-014 — Resume token expired/invalid → 'new chat' state with message
- **Type:** Negative | **Priority:** P0 | **Source:** US-005, FR-039
- **Pre-condition:** Expired resume token
- **Steps:**
  1. Click Continue Chat with expired token
  2. Verify widget shows clear message
  3. Verify opens in 'new chat' state
- **Expected Result:** New chat state with message
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-015 — Session resume takes priority over guest resume
- **Type:** Edge | **Priority:** P0 | **Source:** FR-041, FR-036
- **Pre-condition:** Both session and guest resume available
- **Steps:**
  1. Open Continue Chat with session-livechat.email valid AND guest token
  2. Verify session resume path used (no expiry check)
- **Expected Result:** Session resume prioritized
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-016 — Conversation reopens after transcript sent → no resend (MVP: one email per conversation)
- **Type:** Edge | **Priority:** P0 | **Source:** EC-003, FR-015
- **Pre-condition:** Conversation reopened after transcript sent
- **Steps:**
  1. Reopen conversation that already had transcript sent
  2. Verify NO second transcript email
- **Expected Result:** Single email per conversation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-017 — New message after resolved but before scheduled send → cancel and reschedule
- **Type:** Edge | **Priority:** P0 | **Source:** EC-002, FR-014
- **Pre-condition:** New message arrives after resolved
- **Steps:**
  1. Resolve conversation (transcript scheduled)
  2. Receive new message before scheduled send
  3. Verify scheduled send cancelled
  4. Verify rescheduled per inactivity timeout
- **Expected Result:** Cancelled and rescheduled
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-018 — Continue chat URL not set but button toggle ON → button hidden, email still sent
- **Type:** Edge | **Priority:** P1 | **Source:** EC-008, FR-005
- **Pre-condition:** Button toggle ON but no URL configured
- **Steps:**
  1. Enable Continue Chat toggle but leave URL empty
  2. Send transcript
  3. Verify 'Lanjutkan Chat' button hidden
  4. Verify transcript + public link still sent
- **Expected Result:** Button hidden; email still sent
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-019 — Send failure → retry 3x with exponential backoff, then 'failed'
- **Type:** Negative | **Priority:** P0 | **Source:** FR-038, EH-003
- **Pre-condition:** Email send fails
- **Steps:**
  1. Trigger failing send
  2. Verify 3 retries with backoff
  3. Verify final 'failed' status
- **Expected Result:** Retried then failed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-WIDGETEMAIL-020 — Whitelabel enabled → no SatuInbox branding in email footer
- **Type:** Positive | **Priority:** P1 | **Source:** FR-023
- **Pre-condition:** Whitelabel enabled
- **Steps:**
  1. Enable whitelabel in settings
  2. Send transcript
  3. Verify no SatuInbox branding in email footer
- **Expected Result:** No SatuInbox branding
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## 7. PRD Conversation SLA
- **Status:** DEVELOPED
- **Surface:** Settings → SLA untuk Percakapan (per-channel SLA cards + shared policy) + in-app notifications + dashboard summaries
- **Relation to Conversation:** Defines per-channel SLA metrics (FRT, TTC) with reminders, breach triggers, and dashboard for conversation-level SLA monitoring
- **Requirement IDs:** US-001–US-009, FR-001–FR-072, EH-001–EH-012, EC-001–EC-014

### SC-SLA-001 — Admin opens 'SLA untuk Percakapan' → shared policy + per-channel cards
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-004
- **Pre-condition:** Admin logged in
- **Steps:**
  1. Navigate to Settings → 'SLA untuk Percakapan'
  2. Verify shared 'Kebijakan' section visible
  3. Verify one SLA card per supported channel
  4. Verify each card shows FRT and TTC rows
- **Expected Result:** Policy section + channel cards visible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-002 — Edit FRT/TTC in channel card → only future cycles use new values
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-040, FR-042
- **Pre-condition:** SLA settings page open
- **Steps:**
  1. Edit FRT value for WhatsApp API card
  2. Click 'Simpan perubahan'
  3. Verify confirmation modal 'Terapkan perubahan SLA?'
  4. Confirm
  5. Verify active cycles unchanged; new cycles use new values
- **Expected Result:** Active cycles unchanged; future cycles updated
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-003 — Invalid value → inline validation blocks save in Bahasa
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-001–EH-002
- **Pre-condition:** SLA settings page open
- **Steps:**
  1. Enter empty or out-of-range value (0 or 1000)
  2. Attempt save
  3. Verify inline error in Bahasa Indonesia
  4. Verify save blocked
- **Expected Result:** Validation blocks save
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-004 — Reminder ≥ SLA duration → 'Pengingat harus lebih kecil dari durasi SLA'
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-028, EH-004
- **Pre-condition:** Reminder active with value ≥ SLA duration
- **Steps:**
  1. Set SLA duration to 30 Menit
  2. Set reminder to 30+ Menit
  3. Attempt save
  4. Verify 'Pengingat harus lebih kecil dari durasi SLA'
- **Expected Result:** Reminder validation blocks save
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-005 — Reminder triggers when remaining time ≤ offset → one in-app notification
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-044–FR-045
- **Pre-condition:** Reminder configured; approaching SLA deadline
- **Steps:**
  1. Configure reminder for 5 min before deadline
  2. Wait until remaining ≤ 5 min
  3. Verify one in-app notification sent for that metric/cycle
- **Expected Result:** Reminder notification triggered
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-006 — TTC pause toggle + Waiting on Customer → TTC pauses
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-011–FR-012
- **Pre-condition:** TTC pause toggle enabled
- **Steps:**
  1. Enable 'Jeda SLA TTC saat menunggu balasan pelanggan'
  2. Move conversation to Waiting on Customer
  3. Verify TTC timer pauses
- **Expected Result:** TTC paused during Waiting on Customer
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-007 — AUX counting disabled + agent in AUX → SLA pauses
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-013–FR-014
- **Pre-condition:** AUX counting disabled
- **Steps:**
  1. Disable 'Hitung SLA saat agen dalam mode AUX'
  2. Agent enters AUX mode
  3. Verify running SLA pauses
- **Expected Result:** SLA paused during AUX
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-008 — Policy toggle change → only future cycles use new policy
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-040–FR-041
- **Pre-condition:** Policy toggle changed
- **Steps:**
  1. Change TTC pause toggle
  2. Save
  3. Verify active cycles unchanged; new cycles use new policy
- **Expected Result:** Snapshot rule applies
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-009 — Legacy global SLA → migration creates per-channel records with equivalent values
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-059–FR-062
- **Pre-condition:** Workspace with legacy global conversation SLA
- **Steps:**
  1. Run migration
  2. Verify per-channel SLA records created
  3. Verify values match legacy
- **Expected Result:** Migration preserves values
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-010 — WA Web Group during migration → FRT migrated, TTC stays disabled
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-062, EC-009
- **Pre-condition:** Legacy SLA exists; WA Web Group present
- **Steps:**
  1. Run migration
  2. Verify WA Web Group has FRT from legacy
  3. Verify TTC disabled for WA Web Group
- **Expected Result:** FRT migrated; TTC disabled for Group
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-011 — Migration is idempotent → rerun does not duplicate config
- **Type:** Edge | **Priority:** P0 | **Source:** FR-065
- **Pre-condition:** Migration already completed
- **Steps:**
  1. Run migration again
  2. Verify no duplicate SLA records
  3. Verify existing records unchanged
- **Expected Result:** Idempotent; no duplicates
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-012 — New workspace → standard per-channel defaults seeded automatically
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-067–FR-068
- **Pre-condition:** New workspace with no prior SLA
- **Steps:**
  1. Create new workspace
  2. Open SLA settings
  3. Verify standard defaults seeded per channel matrix
- **Expected Result:** Defaults seeded automatically
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-013 — WA Web Group TTC disabled with 'Belum didukung untuk kanal ini'
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, FR-009–FR-010
- **Pre-condition:** SLA settings page open
- **Steps:**
  1. Open WA Web Group card
  2. Verify TTC row disabled
  3. Verify helper text 'Belum didukung untuk kanal ini'
- **Expected Result:** TTC disabled with helper text
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-014 — Conversation SLA cycle starts when first assigned to agent
- **Type:** Positive | **Priority:** P0 | **Source:** FR-035
- **Pre-condition:** Conversation unassigned
- **Steps:**
  1. Assign conversation to agent
  2. Verify SLA cycle begins (FRT and TTC where supported)
- **Expected Result:** SLA starts on assignment
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-015 — FRT completed when first customer-visible agent message sent; internal notes ignored
- **Type:** Positive | **Priority:** P0 | **Source:** FR-036–FR-037
- **Pre-condition:** SLA cycle active; FRT not yet completed
- **Steps:**
  1. Send internal note → verify FRT NOT completed
  2. Send customer-visible message → verify FRT completed
- **Expected Result:** Internal notes don't trigger FRT
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-016 — TTC completed when resolved/closed; not created for WA Web Group
- **Type:** Positive | **Priority:** P0 | **Source:** FR-038–FR-039
- **Pre-condition:** TTC-supported channel conversation active
- **Steps:**
  1. Resolve conversation → verify TTC completed
  2. For WA Web Group → verify TTC never created
- **Expected Result:** TTC on resolve; no TTC for Group
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-017 — Supervisor receives reminder/breach notification with customer, channel, metric
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-052
- **Pre-condition:** Supervisor in team scope
- **Steps:**
  1. Trigger reminder/breach
  2. Verify supervisor notification includes customer name, channel, metric
  3. Click notification → verify deep link to conversation
- **Expected Result:** Notification with context; deep link works
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-018 — Assignee receives notification; unassigned → only supervisors notified
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-053–FR-054
- **Pre-condition:** Conversation assigned to agent
- **Steps:**
  1. Trigger reminder for assigned conversation
  2. Verify assignee notification
  3. Unassign → trigger again → verify only supervisors notified
- **Expected Result:** Assignee notified; unassigned → supervisors only
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-019 — Assignee changes before trigger → only current assignee notified at trigger time
- **Type:** Edge | **Priority:** P0 | **Source:** EC-004
- **Pre-condition:** Assignee changed before trigger
- **Steps:**
  1. Change assignee before reminder time
  2. Trigger reminder
  3. Verify only new assignee notified, not old
- **Expected Result:** Current assignee only at trigger time
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-020 — Dashboard shows 'SLA Hampir Terlewat' and 'SLA Terlewat' cards
- **Type:** Positive | **Priority:** P1 | **Source:** US-009, FR-055–FR-056
- **Pre-condition:** At-risk and breached conversations exist
- **Steps:**
  1. Navigate to supervisor dashboard
  2. Verify 'SLA Hampir Terlewat' card with count
  3. Verify 'SLA Terlewat' card with count
  4. Click card → verify filtered sorted list
- **Expected Result:** Dashboard cards with counts and drill-down
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-021 — Non-Admin blocked with 'Akses ditolak'
- **Type:** Permission | **Priority:** P0 | **Source:** FR-001, FR-003, EH-006
- **Pre-condition:** Non-Admin user
- **Steps:**
  1. Log in as non-Admin
  2. Navigate to SLA settings
  3. Attempt save
  4. Verify 'Akses ditolak'
- **Expected Result:** Access denied for non-Admin
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-022 — Reminder paused while metric paused → re-evaluated on resume
- **Type:** Edge | **Priority:** P0 | **Source:** FR-046–FR-048, EC-001
- **Pre-condition:** Metric paused with pending reminder
- **Steps:**
  1. Pause TTC via Waiting on Customer
  2. Reach reminder time while paused
  3. Resume TTC
  4. Verify reminder sent if still eligible post-resume
- **Expected Result:** Reminder re-evaluated after resume
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-023 — TTC resumes with remaining already negative → breached immediately
- **Type:** Edge | **Priority:** P0 | **Source:** EC-002
- **Pre-condition:** TTC remaining time negative on resume
- **Steps:**
  1. Pause TTC until remaining goes negative
  2. Resume TTC
  3. Verify immediate breach notification
- **Expected Result:** Immediate breach on resume with negative time
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-SLA-024 — New values saved while active cycles exist → active cycles unchanged (snapshot rule)
- **Type:** Edge | **Priority:** P0 | **Source:** EC-007, FR-040–FR-042
- **Pre-condition:** Active SLA cycles running
- **Steps:**
  1. Change channel SLA values
  2. Save
  3. Verify active cycles use old snapshot
  4. Verify new cycles use new values
- **Expected Result:** Snapshot rule: active unchanged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## 8. PRD Conversation RLT
- **Status:** DEVELOPED
- **Surface:** Conversation Detail + Ticket Detail live timers + offline report export (XLSX)
- **Relation to Conversation:** Adds Response Lead Time (RLT) and Wait Time in Queue metrics as tracked timers for conversations and linked tickets
- **Requirement IDs:** AC-01–AC-11

### SC-RLT-001 — First customer message, no agent → Waktu Antre timer runs from T1
- **Type:** Positive | **Priority:** P0 | **Source:** AC-01
- **Pre-condition:** Customer sends first message to unassigned conversation
- **Steps:**
  1. Customer sends first message
  2. Verify no agent assigned
  3. Open Conversation Detail → verify `[data-cy='Chat-Detail-Sla-wait-time']` timer running
  4. Verify timer started from T1 (first customer message time)
- **Expected Result:** Waktu Antre running from T1
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-RLT-002 — Agent assigned → Waktu Antre stops, final duration stored
- **Type:** Positive | **Priority:** P0 | **Source:** AC-02
- **Pre-condition:** Conversation in queue with running Waktu Antre
- **Steps:**
  1. Assign agent to conversation
  2. Verify `[data-cy='Chat-Detail-Sla-wait-time']` timer stops
  3. Verify final duration stored in database
- **Expected Result:** Queue time finalized on assignment
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-RLT-003 — Agent assigned, no reply yet → Waktu Kerja Staf (RLT) timer runs from T2
- **Type:** Positive | **Priority:** P0 | **Source:** AC-03
- **Pre-condition:** Agent assigned but hasn't replied
- **Steps:**
  1. Open Conversation Detail after assignment
  2. Verify `[data-cy='Chat-Detail-Sla-rlt']` timer running
  3. Verify timer started from T2 (first assignment time)
- **Expected Result:** RLT timer running from T2
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-RLT-004 — First customer-facing reply sent → RLT timer stops, duration stored
- **Type:** Positive | **Priority:** P0 | **Source:** AC-04
- **Pre-condition:** RLT timer running; agent about to reply
- **Steps:**
  1. Agent sends first customer-facing reply
  2. Verify `[data-cy='Chat-Detail-Sla-rlt']` timer stops
  3. Verify final duration stored
- **Expected Result:** RLT finalized on first reply
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-RLT-005 — Internal notes, failed replies, drafts, system messages → do NOT count as T3
- **Type:** Edge | **Priority:** P0 | **Source:** AC-05
- **Pre-condition:** RLT timer running
- **Steps:**
  1. Send internal note → verify RLT continues
  2. Send draft → verify RLT continues
  3. Trigger system message → verify RLT continues
- **Expected Result:** Non-customer-facing messages don't stop RLT
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-RLT-006 — Reassignment before first reply → primary RLT does NOT reset
- **Type:** Edge | **Priority:** P0 | **Source:** AC-06
- **Pre-condition:** RLT running, agent being reassigned
- **Steps:**
  1. Reassign conversation to different agent before first reply
  2. Verify `[data-cy='Chat-Detail-Sla-rlt']` timer does NOT reset
  3. Verify T2 remains original assignment time
- **Expected Result:** RLT not reset on reassignment
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-RLT-007 — Multi-assignee → first assignment as T2, first replying agent stored
- **Type:** Edge | **Priority:** P0 | **Source:** AC-07
- **Pre-condition:** Conversation with multiple assignees
- **Steps:**
  1. Assign Agent A, then Agent B
  2. Agent B replies first
  3. Verify T2 = Agent A assignment time
  4. Verify Agent B stored as first responder
- **Expected Result:** Earliest assignment = T2; first responder = first replying agent
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-RLT-008 — Linked ticket shows inherited RLT and Wait Time from linked conversation
- **Type:** Positive | **Priority:** P0 | **Source:** AC-08
- **Pre-condition:** Ticket linked to conversation with RLT/Wait Time data
- **Steps:**
  1. Open linked Ticket Detail
  2. Verify `[data-cy='Chat-Detail-Sla-rlt']` and `[data-cy='Chat-Detail-Sla-wait-time']` show inherited values from linked conversation
- **Expected Result:** Ticket inherits metrics from conversation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-RLT-009 — Internal-only ticket (no linked conversation) → 'Tidak berlaku'
- **Type:** Edge | **Priority:** P0 | **Source:** AC-09
- **Pre-condition:** Ticket created without linked customer conversation
- **Steps:**
  1. Open internal-only Ticket Detail
  2. Verify RLT and Wait Time show 'Tidak berlaku'
- **Expected Result:** Tidak berlaku for internal tickets
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-RLT-010 — Offline Report Download includes RLT and Wait Time columns
- **Type:** Positive | **Priority:** P0 | **Source:** AC-10
- **Pre-condition:** Conversations with RLT/Wait Time data exist
- **Steps:**
  1. Download Conversation XLSX report
  2. Verify columns: First Customer Message At, First Assigned At, Wait Time in Queue, Response Lead Time
  3. Download Ticket XLSX report
  4. Verify linked conversation metric columns
- **Expected Result:** Export includes RLT and Wait Time columns
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-RLT-011 — No alert, reminder, breach, notification, or escalation in Phase 1
- **Type:** Regression | **Priority:** P0 | **Source:** AC-11
- **Pre-condition:** RLT and Wait Time running
- **Steps:**
  1. Let RLT/Wait Time exceed any threshold
  2. Verify NO alert, reminder, breach badge, notification, or escalation triggered
- **Expected Result:** No alerts for RLT/Wait Time in Phase 1
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## 9. PRD Analytics - Conversation
- **Status:** DEVELOPED
- **Surface:** Analytics → Percakapan page with KPI cards, charts, filter bar
- **Relation to Conversation:** Provides conversation analytics: volume, workload, responsiveness proxies, unassigned backlog, tagging usage
- **Requirement IDs:** US-001–US-006, FR-001–FR-031, EH-001–EH-006, EC-001–EC-008

### SC-ANALYTICS-001 — Admin/Supervisor opens Analitik → Percakapan → 8 KPI cards + 4 charts
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-010–FR-017
- **Pre-condition:** Admin/Supervisor logged in with analytics permission
- **Steps:**
  1. Navigate to Analitik → Percakapan
  2. Verify page loads with 8 KPI cards
  3. Verify 4 charts present
  4. Verify default date range '30 hari terakhir'
- **Expected Result:** 8 KPI cards + 4 charts loaded
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-002 — Default date range '30 hari terakhir'; changing range refreshes all
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, US-002, FR-003, FR-007
- **Pre-condition:** Analytics page loaded
- **Steps:**
  1. Verify default date range '30 hari terakhir'
  2. Change date range to '7 hari terakhir'
  3. Verify all KPI and charts refresh
  4. Verify values match new range
- **Expected Result:** Default range applied; refresh on change
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-003 — No data in range → KPI shows 0, charts show 'Belum ada data pada periode ini'
- **Type:** State | **Priority:** P0 | **Source:** US-001, EH-002
- **Pre-condition:** Date range with no data
- **Steps:**
  1. Select date range with no conversations
  2. Verify all KPI values show 0
  3. Verify charts show 'Belum ada data pada periode ini'
- **Expected Result:** Zero KPI; empty chart states
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-004 — Team/Agent/Channel filters applied → all KPI and charts reflect scope
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-007
- **Pre-condition:** Analytics page loaded
- **Steps:**
  1. Select specific Team filter
  2. Verify all KPI update
  3. Select specific Agent → verify update
  4. Select specific Channel → verify update
- **Expected Result:** Filters applied consistently to all
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-005 — Entity metrics use assignee at event time for attribution
- **Type:** Positive | **Priority:** P0 | **Source:** FR-008, EC-003
- **Pre-condition:** Conversation reassigned during period
- **Steps:**
  1. Apply Team/Agent filter
  2. Verify metrics attributed using assignee AT EVENT TIME (not current assignee)
- **Expected Result:** Event-time attribution correct
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-006 — 'Total chat belum ter-assign' visible when 'Semua tim' + 'Semua agen'
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-017
- **Pre-condition:** Filters at default (all)
- **Steps:**
  1. Verify 'Semua tim' and 'Semua agen' selected
  2. Verify 'Total chat belum ter-assign' KPI visible with count
- **Expected Result:** Unassigned KPI visible at default scope
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-007 — 'Total chat belum ter-assign' hidden when Agent ≠ 'Semua agen'
- **Type:** Edge | **Priority:** P0 | **Source:** FR-019
- **Pre-condition:** Agent filter set to specific agent
- **Steps:**
  1. Select specific agent in Agent filter
  2. Verify 'Total chat belum ter-assign' KPI hidden
- **Expected Result:** Hidden when specific agent selected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-008 — 'Total chat belum ter-assign' hidden when Team ≠ 'Semua tim'
- **Type:** Edge | **Priority:** P0 | **Source:** FR-020
- **Pre-condition:** Team filter set to specific team
- **Steps:**
  1. Select specific team
  2. Verify 'Total chat belum ter-assign' KPI hidden
- **Expected Result:** Hidden when specific team selected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-009 — 'Total percakapan - berdasarkan waktu' bar chart shows daily counts
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-021
- **Pre-condition:** Data exists in range
- **Steps:**
  1. Verify bar chart titled 'Total percakapan - berdasarkan waktu'
  2. Verify daily conversation counts displayed
  3. Hover to verify tooltip with date and value
- **Expected Result:** Daily bar chart with tooltips
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-010 — 'Total percakapan - berdasarkan kanal' donut chart shows channel distribution
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-022
- **Pre-condition:** Data exists across channels
- **Steps:**
  1. Verify donut chart with channel segments
  2. Hover to verify tooltip with channel name and count
- **Expected Result:** Channel donut chart with tooltips
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-011 — Channel filter active → channel distribution chart hidden with message
- **Type:** Edge | **Priority:** P0 | **Source:** FR-027, EC-006
- **Pre-condition:** Specific channel selected
- **Steps:**
  1. Select specific channel in filter
  2. Verify 'Total percakapan - berdasarkan kanal' chart hidden
  3. Verify informational message replacing it
- **Expected Result:** Chart hidden; message shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-012 — 'Total balasan - berdasarkan waktu' shows daily reply counts
- **Type:** Positive | **Priority:** P1 | **Source:** US-005, FR-023
- **Pre-condition:** Reply data exists
- **Steps:**
  1. Verify daily reply chart
  2. Apply Agent filter → verify counts by selected agents only
- **Expected Result:** Reply chart with agent attribution
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-013 — 'Total tag - berdasarkan kategori' shows tag counts per category
- **Type:** Positive | **Priority:** P1 | **Source:** US-005, FR-024
- **Pre-condition:** Tags exist
- **Steps:**
  1. Verify horizontal bar chart with tag categories
  2. Verify empty state when no tags exist
- **Expected Result:** Tag category chart
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-014 — Charts show tooltip on hover with date/category and numeric value
- **Type:** Positive | **Priority:** P1 | **Source:** FR-025
- **Pre-condition:** Charts loaded with data
- **Steps:**
  1. Hover over chart element
  2. Verify tooltip shows date/category and numeric value
- **Expected Result:** Tooltip with context and value
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-015 — Unauthorized user → 'Akses ditolak'; page content blocked
- **Type:** Permission | **Priority:** P0 | **Source:** US-006, FR-001–FR-002, EH-001
- **Pre-condition:** User without analytics permission
- **Steps:**
  1. Navigate to Analitik → Percakapan as unauthorized user
  2. Verify 'Akses ditolak' displayed
  3. Verify no KPI or chart data visible
- **Expected Result:** Access denied; no data shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-016 — Analytics service failure → error state with 'Coba lagi'
- **Type:** Negative | **Priority:** P0 | **Source:** US-006, EH-004
- **Pre-condition:** Analytics service returning errors
- **Steps:**
  1. Load analytics page during service failure
  2. Verify error state displayed
  3. Verify 'Coba lagi' button available
- **Expected Result:** Error state with retry
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-017 — Filter load failure → filters disabled, 'Gagal memuat filter' with retry
- **Type:** Negative | **Priority:** P0 | **Source:** EH-003
- **Pre-condition:** Filter service failing
- **Steps:**
  1. Load analytics page during filter service failure
  2. Verify filters disabled
  3. Verify 'Gagal memuat filter' message
  4. Verify 'Coba lagi' button
- **Expected Result:** Filters disabled with retry
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-ANALYTICS-018 — 'Terakhir diperbarui' timestamp shown in Asia/Jakarta time
- **Type:** Positive | **Priority:** P0 | **Source:** FR-028
- **Pre-condition:** Analytics page loaded
- **Steps:**
  1. Verify 'Terakhir diperbarui' timestamp visible
  2. Verify timestamp in Asia/Jakarta timezone format
- **Expected Result:** Timestamp in correct timezone
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## 10. PRD OPEN API - conversation n ticket
- **Status:** DEVELOPED
- **Surface:** REST API endpoints (GET /inbox, PATCH /inbox/{id}, PUT /contacts/{id}, POST /inbox/{id}/links, PATCH /inbox/bulk, webhooks)
- **Relation to Conversation:** Programmatic search, update, and enrichment of conversations and tickets via Open API
- **Requirement IDs:** User Stories (search, update, auto-resolve, enrich, link, bulk, webhook), Error Codes (400-INV-PROP, 400-INV-STATUS, 404-NOT-FOUND, 409-DUP-LINK, 429-RATE-LIMIT, 500-SRV-ERR)

### SC-OPENAPI-001 — GET /inbox?properties[awb]=12345 returns matching results with pagination
- **Type:** Contract (success) | **Priority:** P0 | **Source:** User Story: search
- **Pre-condition:** API key/token available; inbox items with awb property exist
- **Steps:**
  1. Send `curl -H 'Authorization: Bearer {token}' 'https://api.satuinbox.com/v1/inbox?properties[awb]=12345&page=1&limit=20'`
  2. Verify HTTP 200 response
  3. Verify response contains matching items
  4. Verify pagination fields (page, limit, total) present
- **Expected Result:** 200 OK with matching results and pagination
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-002 — Search supports AND/OR filters by status, date range, team, agent
- **Type:** Contract (success) | **Priority:** P0 | **Source:** User Story: search
- **Pre-condition:** Various inbox items exist
- **Steps:**
  1. Send `curl '.../v1/inbox?status=ongoing&date_from=2026-01-01&team=team-1'`
  2. Verify HTTP 200
  3. Verify results match all filter criteria
  4. Verify AND logic applied
- **Expected Result:** 200 OK with filtered results
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-003 — PATCH /inbox/{id} with valid status transition succeeds with audit
- **Type:** Contract (success) | **Priority:** P0 | **Source:** User Story: update
- **Pre-condition:** Inbox item in 'unassigned' status
- **Steps:**
  1. Send `curl -X PATCH '.../v1/inbox/{id}' -d '{"status":"ongoing"}' -H 'Content-Type: application/json'`
  2. Verify HTTP 200
  3. Verify status updated to 'ongoing'
  4. Verify audit log entry with `source=api`
- **Expected Result:** 200 OK; status updated; audit logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-004 — PATCH /inbox/{id} with invalid status transition → 400-INV-STATUS
- **Type:** Contract (validation-error) | **Priority:** P0 | **Source:** Error: 400-INVALID-STATUS
- **Pre-condition:** Inbox item in 'resolved' status
- **Steps:**
  1. Send PATCH with `{"status":"unassigned"}` (invalid: resolved→unassigned)
  2. Verify HTTP 400
  3. Verify response contains `{"error":"Invalid status transition"}`
- **Expected Result:** 400 with validation error
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-005 — PATCH /inbox/{id} with invalid property format → 400-INV-PROP
- **Type:** Contract (validation-error) | **Priority:** P0 | **Source:** Error: 400-INV-PROP
- **Pre-condition:** Valid inbox item ID
- **Steps:**
  1. Send PATCH with malformed properties JSON
  2. Verify HTTP 400
  3. Verify `{"error":"Invalid property format"}`
- **Expected Result:** 400 with property validation error
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-006 — PATCH /inbox/{id} with non-existent ID → 404-NOT-FOUND
- **Type:** Contract (validation-error) | **Priority:** P0 | **Source:** Error: 404-NOT-FOUND
- **Pre-condition:** Non-existent ID used
- **Steps:**
  1. Send PATCH to `.../v1/inbox/non-existent-id`
  2. Verify HTTP 404
  3. Verify `{"error":"Inbox item not found"}`
- **Expected Result:** 404 not found
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-007 — External system auto-resolves ticket via PATCH; audit includes external event ID
- **Type:** Contract (success) | **Priority:** P0 | **Source:** User Story: auto-resolve
- **Pre-condition:** Open inbox item; external system (e.g. SAPX) configured
- **Steps:**
  1. Send `curl -X PATCH '.../v1/inbox/{id}' -d '{"status":"resolved","properties":{"resolved_by":"SAPX"}}'`
  2. Verify HTTP 200
  3. Verify status='resolved'
  4. Verify audit includes external event ID
- **Expected Result:** 200 OK; resolved; audit with external ID
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-008 — PUT /contacts/{id} with transactions[] accepted; visible in sidebar UI
- **Type:** Contract (success) | **Priority:** P1 | **Source:** User Story: enrich
- **Pre-condition:** Valid contact ID
- **Steps:**
  1. Send `curl -X PUT '.../v1/contacts/{id}' -d '{"transactions":[{"ref_id":"ORD-9912","status":"delivered","date":"2026-01-01T00:00:00Z","amount":250000,"currency":"IDR"}]}'`
  2. Verify HTTP 200
  3. Open contact in UI → verify transactions in sidebar
- **Expected Result:** 200 OK; transactions visible in UI
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-009 — PUT /contacts/{id} with invalid data → 400
- **Type:** Contract (validation-error) | **Priority:** P1 | **Source:** User Story: enrich
- **Pre-condition:** Valid contact ID
- **Steps:**
  1. Send PUT with invalid transaction data (missing required fields)
  2. Verify HTTP 400
  3. Verify error response describes validation failure
- **Expected Result:** 400 validation error
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-010 — POST /inbox/{id}/links attaches external ticket; visible in Linked Tickets
- **Type:** Contract (success) | **Priority:** P1 | **Source:** User Story: link
- **Pre-condition:** Valid inbox item ID
- **Steps:**
  1. Send `curl -X POST '.../v1/inbox/{id}/links' -d '{"external_ticket_id":"SAPX-777","source":"SAPX","url":"https://sapx.com/ticket/777"}'`
  2. Verify HTTP 200/201
  3. Open inbox item → verify Linked Tickets section shows new link
- **Expected Result:** 200 OK; linked ticket visible in UI
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-011 — POST /inbox/{id}/links with duplicate link → 409-DUP-LINK
- **Type:** Contract (conflict) | **Priority:** P1 | **Source:** Error: 409-DUP-LINK
- **Pre-condition:** Link already exists
- **Steps:**
  1. Send same link POST again
  2. Verify HTTP 409
  3. Verify `{"error":"Already linked"}`
- **Expected Result:** 409 duplicate link
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-012 — PATCH /inbox/bulk accepts up to 1000 IDs per request
- **Type:** Contract (success) | **Priority:** P1 | **Source:** User Story: bulk
- **Pre-condition:** 1000 inbox item IDs available
- **Steps:**
  1. Send `curl -X PATCH '.../v1/inbox/bulk' -d '{"ids":[...1000 IDs...],"status":"resolved"}'`
  2. Verify HTTP 200
  3. Verify bulk update accepted
- **Expected Result:** 200 OK; bulk accepted
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-013 — Rate limit exceeded (100 req/sec/tenant) → 429-RATE-LIMIT
- **Type:** Contract (permission) | **Priority:** P0 | **Source:** Error: 429-RATE-LIMIT
- **Pre-condition:** Rapid requests exceeding limit
- **Steps:**
  1. Send >100 requests within 1 second
  2. Verify HTTP 429 on excess requests
  3. Verify `{"error":"Too many requests","retry_after":N}`
- **Expected Result:** 429 with retry_after
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-014 — Server error → 500-SRV-ERR
- **Type:** Contract (validation-error) | **Priority:** P0 | **Source:** Error: 500-SRV-ERR
- **Pre-condition:** Server-side error condition
- **Steps:**
  1. Trigger server error scenario
  2. Verify HTTP 500
  3. Verify `{"error":"Internal server error"}`
- **Expected Result:** 500 internal error
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-015 — API auth: OAuth2.0/API Key required; unauthenticated → 401
- **Type:** Contract (permission) | **Priority:** P0 | **Source:** NFR: Authentication
- **Pre-condition:** No auth token provided
- **Steps:**
  1. Send request without Authorization header
  2. Verify HTTP 401
  3. Verify authentication error response
- **Expected Result:** 401 unauthorized
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-016 — PII masking: phone/email masked unless caller has admin scope
- **Type:** Contract (permission) | **Priority:** P0 | **Source:** NFR: PII Masking
- **Pre-condition:** Contact with phone/email; non-admin API caller
- **Steps:**
  1. Send GET for contact as non-admin caller
  2. Verify phone masked (e.g. '+628****7890')
  3. Verify email masked
  4. Send as admin → verify unmasked
- **Expected Result:** PII masked for non-admin; full for admin
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-017 — Idempotency-Key header supported for PATCH/POST
- **Type:** Contract (idempotency) | **Priority:** P0 | **Source:** NFR: Idempotency
- **Pre-condition:** Inbox item to update
- **Steps:**
  1. Send PATCH with `Idempotency-Key: abc-123` → verify success
  2. Send same PATCH with same key → verify idempotent response (same result, no duplicate)
- **Expected Result:** Idempotent with same key
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-018 — All endpoints prefixed with /v1/; response schema backward compatible
- **Type:** Contract (backward-compat) | **Priority:** P0 | **Source:** NFR: Versioning
- **Pre-condition:** API available
- **Steps:**
  1. Verify all endpoints use `/v1/` prefix
  2. Verify response schemas match documented format
  3. Verify no breaking changes from prior version
- **Expected Result:** /v1/ prefix; stable schema
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-019 — Every API action logged with actor, source=api, timestamp
- **Type:** Contract (success) | **Priority:** P0 | **Source:** NFR: Audit Trail
- **Pre-condition:** API operations performed
- **Steps:**
  1. Perform various API actions (search, update, link)
  2. Check audit log entries
  3. Verify each has actor, source='api', timestamp
- **Expected Result:** Full audit trail for all API actions
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-OPENAPI-020 — Transactions limit 200/contact; Properties JSON ≤ 8KB → 400 if exceeded
- **Type:** Contract (validation-error) | **Priority:** P1 | **Source:** Limitations
- **Pre-condition:** Limits to test
- **Steps:**
  1. Send PUT /contacts/{id} with 201 transactions → verify 400
  2. Send PATCH /inbox/{id} with >8KB properties → verify 400
- **Expected Result:** 400 when limits exceeded
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## 11. PRD Public ID Prefix and Sequential Numbering for Conversation
- **Status:** DEVELOPED
- **Surface:** Conversation detail header + Ticket detail header + global search + exports
- **Relation to Conversation:** Provides human-readable public IDs (CV-{n}, TK-{n}) for conversations and tickets
- **Requirement IDs:** US-001–US-004, FR-001–FR-016, EH-001–EH-004, EC-001–EC-005

### SC-PUBLICID-001 — First conversation in new tenant → public ID is CV-0
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-005
- **Pre-condition:** New tenant with zero conversations
- **Steps:**
  1. Create first conversation in new tenant
  2. Open Conversation Detail
  3. Verify public ID is 'CV-0'
- **Expected Result:** First ID = CV-0
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-PUBLICID-002 — CV-9 exists → next is CV-10; TK-99 → next is TK-100
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-006–FR-007
- **Pre-condition:** Sequential numbering test
- **Steps:**
  1. Create conversation when CV-9 exists → verify CV-10
  2. Create ticket when TK-99 exists → verify TK-100
- **Expected Result:** Sequential increment; digit growth natural
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-PUBLICID-003 — Conversation detail shows CV-{n} in header with copy button
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-011
- **Pre-condition:** Conversation exists with public ID
- **Steps:**
  1. Open Conversation Detail
  2. Verify `[data-cy='Chat-Detail-Title']` area shows 'CV-{n}'
  3. Verify `[data-cy='Chat-Detail-Copy-Id-Button']` button present
  4. Click copy → verify clipboard
- **Expected Result:** Public ID displayed with copy button
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-PUBLICID-004 — Ticket detail shows TK-{n} in header with copy button
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-011
- **Pre-condition:** Ticket exists with public ID
- **Steps:**
  1. Open Ticket Detail
  2. Verify 'TK-{n}' displayed
  3. Verify copy button functional
- **Expected Result:** Ticket public ID displayed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-PUBLICID-005 — Global search by exact CV-10 or TK-10 finds matching entity
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-013
- **Pre-condition:** Entity with known public ID exists
- **Steps:**
  1. Press Ctrl+K, type 'CV-10'
  2. Verify matching conversation found
  3. Press Ctrl+K, type 'TK-10'
  4. Verify matching ticket found
- **Expected Result:** Exact public ID search works
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-PUBLICID-006 — Search for non-existing public ID → empty state, no wrong result
- **Type:** Negative | **Priority:** P0 | **Source:** US-001
- **Pre-condition:** Non-existent public ID
- **Steps:**
  1. Press Ctrl+K, type 'CV-99999' (non-existent)
  2. Verify empty state
  3. Verify no incorrect results
- **Expected Result:** Empty; no false matches
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-PUBLICID-007 — Public ID immutable once assigned; never changes
- **Type:** Positive | **Priority:** P0 | **Source:** FR-003
- **Pre-condition:** Conversation with assigned public ID
- **Steps:**
  1. Note public ID of conversation
  2. Perform various operations (reassign, tag, resolve)
  3. Re-open detail → verify same public ID
- **Expected Result:** Immutable; never changes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-PUBLICID-008 — Deleted item's public ID is never reused
- **Type:** Edge | **Priority:** P0 | **Source:** FR-008
- **Pre-condition:** Conversation deleted with public ID CV-5
- **Steps:**
  1. Delete conversation with CV-5
  2. Create new conversation
  3. Verify new conversation gets CV-6 (or next), NOT CV-5
- **Expected Result:** Deleted IDs never reused
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-PUBLICID-009 — Concurrent creation → both get unique public IDs (atomic uniqueness)
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-009
- **Pre-condition:** Simultaneous conversation creation
- **Steps:**
  1. Create two conversations concurrently (API or rapid UI)
  2. Verify each gets unique public ID
  3. Verify no duplicate IDs
- **Expected Result:** Unique IDs under concurrency
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-PUBLICID-010 — Unique constraint violation → retry 3x; 'Gagal membuat ID. Coba lagi.' on final failure
- **Type:** Negative | **Priority:** P0 | **Source:** FR-010, EH-001–EH-002
- **Pre-condition:** Constraint violation scenario
- **Steps:**
  1. Trigger unique constraint edge case
  2. Verify auto-retry up to 3 times
  3. Verify 'Gagal membuat ID. Coba lagi.' toast on final failure
- **Expected Result:** Retry then error toast
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-PUBLICID-011 — Backfill assigns public IDs to existing records; idempotent
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-014–FR-016
- **Pre-condition:** Existing records without public IDs
- **Steps:**
  1. Run backfill process
  2. Verify public IDs assigned to all existing records
  3. Run backfill again → verify no changes to already-assigned IDs
- **Expected Result:** Backfill idempotent; preserves existing
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-PUBLICID-012 — Backfill partial failure → 'ID belum tersedia'; error logged for retry
- **Type:** Negative | **Priority:** P1 | **Source:** US-004, EH-003
- **Pre-condition:** Some records fail backfill
- **Steps:**
  1. Trigger backfill with some failing records
  2. Verify failed items show 'ID belum tersedia'
  3. Verify error logged for retry
- **Expected Result:** Fallback label; error logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-PUBLICID-013 — Search input not matching CV/TK format → 'Format ID tidak valid'
- **Type:** Negative | **Priority:** P0 | **Source:** EH-004
- **Pre-condition:** Invalid format search input
- **Steps:**
  1. Press Ctrl+K, type 'INVALID-ID'
  2. Verify 'Format ID tidak valid' inline error
- **Expected Result:** Format validation error
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-PUBLICID-014 — Cloned/duplicated item → receives new public ID from next sequence
- **Type:** Edge | **Priority:** P1 | **Source:** EC-002
- **Pre-condition:** Item being cloned/duplicated
- **Steps:**
  1. Clone a conversation
  2. Verify clone receives new public ID from next sequence
  3. Verify original ID unchanged
- **Expected Result:** New ID for clone; original preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## 12. PRD Conversation - macro
- **Status:** DEVELOPED
- **Surface:** Settings → Template Pesan (template list CRUD) + chat composer auto-complete
- **Relation to Conversation:** Provides reusable message templates (macros) that agents insert into conversations via shortcut
- **Requirement IDs:** User Stories (list/search, create, edit, delete, insert, variables, categorize, visibility, version history, bulk import/export), Error Codes (400-TM01–TM04, 403-TM05, 500-TM06)

### SC-MACRO-001 — Admin views template list with Shortcut and Message columns; search ≤1s
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: list/search
- **Pre-condition:** Templates exist
- **Steps:**
  1. Navigate to Settings → Template Pesan
  2. Verify list shows Shortcut and Message columns
  3. Type search query → verify results update in ≤1s
- **Expected Result:** Template list with fast search
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-002 — Admin creates template: shortcut starts with /, message required; appears in list
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: create
- **Pre-condition:** Admin on template page
- **Steps:**
  1. Click 'Template Baru'
  2. Enter shortcut '/thankyou'
  3. Enter message 'Terima kasih atas pesanan Anda'
  4. Click Save
  5. Verify template appears in list
- **Expected Result:** Created and visible in list
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-003 — Shortcut blank or not starting with / → error
- **Type:** Negative | **Priority:** P0 | **Source:** Error: 400-TM01
- **Pre-condition:** Create/edit modal open
- **Steps:**
  1. Leave shortcut blank → attempt save
  2. Verify 'Shortcut harus diisi dan dimulai dengan \'/\'.'
  3. Enter 'no-slash' → attempt save
  4. Verify same error
- **Expected Result:** Validation blocks invalid shortcut
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-004 — Duplicate shortcut → 'Shortcut sudah digunakan. Gunakan nama lain.'
- **Type:** Negative | **Priority:** P0 | **Source:** Error: 400-TM02
- **Pre-condition:** Shortcut already exists
- **Steps:**
  1. Create template with existing shortcut '/thankyou'
  2. Verify 'Shortcut sudah digunakan. Gunakan nama lain.'
- **Expected Result:** Duplicate shortcut rejected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-005 — Message blank → 'Pesan template tidak boleh kosong.'
- **Type:** Negative | **Priority:** P0 | **Source:** Error: 400-TM03
- **Pre-condition:** Create/edit modal open
- **Steps:**
  1. Enter valid shortcut but leave message blank
  2. Attempt save
  3. Verify 'Pesan template tidak boleh kosong.'
- **Expected Result:** Empty message rejected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-006 — Admin edits template: modal pre-fills; shortcut uniqueness validated on save
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: edit
- **Pre-condition:** Template exists
- **Steps:**
  1. Click edit on template row
  2. Verify modal pre-fills shortcut and message
  3. Modify message text
  4. Save → verify updated in list
  5. Change shortcut to duplicate → verify uniqueness error
- **Expected Result:** Edit with pre-fill and validation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-007 — Admin deletes template via row menu → confirmation → removed
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: delete
- **Pre-condition:** Template exists
- **Steps:**
  1. Click three-dot menu on template row
  2. Click Delete
  3. Verify confirmation modal appears
  4. Confirm → verify template removed from list
- **Expected Result:** Delete with confirmation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-008 — Agent types / in chat → auto-complete list appears
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: insert
- **Pre-condition:** Templates exist; agent in conversation room
- **Steps:**
  1. Open conversation room
  2. Click in `[data-cy='Message-Text-Input']`
  3. Type '/'
  4. Verify auto-complete list of templates appears
- **Expected Result:** Auto-complete on / trigger
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-009 — Agent selects template → message inserted with variables replaced; missing data shows fallback
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: insert + variables
- **Pre-condition:** Template with {customer_name} variable
- **Steps:**
  1. Type '/' in chat input
  2. Select template with variables
  3. Verify message inserted with {customer_name} replaced
  4. Verify fallback text for missing variables
- **Expected Result:** Variables replaced; fallback for missing
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-010 — Invalid variable token → 'Variabel tidak dikenal: {variable}.'
- **Type:** Negative | **Priority:** P1 | **Source:** Error: 400-TM04
- **Pre-condition:** Template with invalid variable
- **Steps:**
  1. Create template with unknown {bad_variable} token
  2. Save template
  3. Verify 'Variabel tidak dikenal: {bad_variable}.' error
- **Expected Result:** Unknown variable rejected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-011 — Agent without permission → 'Anda tidak memiliki izin untuk mengubah template ini.'
- **Type:** Permission | **Priority:** P0 | **Source:** Error: 403-TM05
- **Pre-condition:** Agent without template edit permission
- **Steps:**
  1. Attempt to edit template as no-permission agent
  2. Verify 'Anda tidak memiliki izin untuk mengubah template ini.'
- **Expected Result:** Permission denied
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-012 — Templates assigned to category/folder; category filter available
- **Type:** Positive | **Priority:** P1 | **Source:** User Story: categorize
- **Pre-condition:** Templates with categories
- **Steps:**
  1. Create template with category 'Greetings'
  2. Verify category filter available in list
  3. Filter by category → verify results
- **Expected Result:** Category assignment and filtering
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-013 — Visibility: Global, Channel-specific, or Team-specific; agents see matching scope
- **Type:** Positive | **Priority:** P1 | **Source:** User Story: visibility
- **Pre-condition:** Templates with different visibility scopes
- **Steps:**
  1. Create Global template → verify all agents see it
  2. Create Channel:WhatsApp template → verify only WA agents see it
  3. Create Team:Team-A template → verify only Team-A sees it
- **Expected Result:** Visibility scoping works
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-014 — Shortcut ≤30 chars, alphanumeric + underscores, unique within scope
- **Type:** Positive | **Priority:** P0 | **Source:** Field: Shortcut
- **Pre-condition:** Template creation
- **Steps:**
  1. Enter shortcut '/test_123' (valid, ≤30 chars) → verify accepted
  2. Enter shortcut '/test-with-dashes' → verify rejected (no dashes allowed)
  3. Enter 31-char shortcut → verify length validation
- **Expected Result:** Format and length validation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-015 — Server error → 'Gagal menyimpan template. Coba lagi nanti.'
- **Type:** Negative | **Priority:** P0 | **Source:** Error: 500-TM06
- **Pre-condition:** Server error during save
- **Steps:**
  1. Trigger server error during template save
  2. Verify 'Gagal menyimpan template. Coba lagi nanti.'
- **Expected Result:** Server error handled gracefully
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
### SC-MACRO-016 — Changes propagate across all agent views within 5 seconds (real-time)
- **Type:** Positive | **Priority:** P1 | **Source:** NFR: Real-time
- **Pre-condition:** Templates edited; agents viewing list
- **Steps:**
  1. Admin creates/edits template
  2. Agent views template list
  3. Verify changes appear within 5 seconds
  4. Verify no manual refresh needed
- **Expected Result:** Real-time propagation within 5s
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## Summary

| # | PRD | Surface | Status | #Scenarios | Enrichment |
|---|-----|---------|--------|------------|------------|
| 1 | Global Search | Search popup modal | DEVELOPED | 20 | Full steps |
| 2 | Actionable Shared Attribute | Search popup + bulk action | UNKNOWN | 18 | Full steps (verify) |
| 3 | Shopee Channel Add-On | Settings + Inbox + Room | UNKNOWN | 25 | Full steps (verify) |
| 4 | Transcript Reply via Email | Transcript email + grouped room | DEVELOPED | 24 | Full steps |
| 5 | Inbox Conversation - reply via email | Transcript email + grouped room | ADJACENT | 24 | Full steps (overlap) |
| 6 | Widget - email transcript | Widget settings + email + public | ADJACENT | 20 | Full steps (overlap) |
| 7 | Conversation SLA | Settings + SLA cards + dashboard | DEVELOPED | 24 | Full steps |
| 8 | Conversation RLT | Detail timers + export | DEVELOPED | 11 | Full steps |
| 9 | Analytics - Conversation | Analytics page KPI + charts | DEVELOPED | 18 | Full steps |
| 10 | OPEN API | REST endpoints | DEVELOPED | 20 | API call format |
| 11 | Public ID | Detail headers + search + export | DEVELOPED | 14 | Full steps |
| 12 | Conversation macro | Settings + composer | DEVELOPED | 16 | Full steps |
| | | | **Grand Total** | **234** | |
