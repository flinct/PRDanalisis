# Conversation Scenario Catalog — Part C: Adjacent Surfaces (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **PRD Sources:** Global Search, Shared Attribute Search, Shopee Channel Add-On
> **Scenarios:** 63 (SC-GSEARCH 20 + SC-SHAREATTR 18 + SC-SHOPEE 25)

---

# 1. SC-GSEARCH: Global Search (Conversation + Ticket)

> **Status:** DEVELOPED
> **PRD:** `PRD/Conversationv2/PRD - Global Search (Conversation + Ticket).md`
> **Surface:** Centered popup modal (Cari sidenav / Ctrl+K) + full-page `/search` fallback

---

### SC-GSEARCH-001 — Search by business identifier returns results from both domains
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-007–FR-010
- **Pre-condition:** Agent logged in; workspace has at least one Ticket and one Conversation both containing the same AWB value (e.g. "AWB-1234")
- **Steps:**
  1. Press `Ctrl+K` or click "Cari" in sidenav to open search popup
  2. Verify centered popup modal appears with input auto-focused
  3. Type `AWB-1234` in the search input
  4. Wait for results to load
  5. Verify "Tiket" section appears with matching Ticket result
  6. Verify "Percakapan" section appears with matching Conversation result
  7. Verify both sections display in one unified popup surface
- **Expected Result:** Search returns matching results from both Ticket and Conversation domains grouped in one surface; each section header labels the domain
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-GSEARCH-002 — Only Ticket section shown when only Ticket matches exist
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-020
- **Pre-condition:** Workspace has a Ticket with AWB "AWB-9999" but no Conversation contains that value
- **Steps:**
  1. Open search popup via `Ctrl+K`
  2. Type `AWB-9999` in search input
  3. Wait for results
  4. Verify "Tiket" section visible with at least one result
  5. Verify "Percakapan" section is NOT visible (hidden, not just empty)
- **Expected Result:** Only Ticket section rendered; Conversation section hidden entirely
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-003 — Only Conversation section shown when only Conversation matches exist
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-020
- **Pre-condition:** Workspace has a Conversation with Order ID "ORD-5555" but no Ticket contains that value
- **Steps:**
  1. Open search popup via `Ctrl+K`
  2. Type `ORD-5555` in search input
  3. Wait for results
  4. Verify "Percakapan" section visible with at least one result
  5. Verify "Tiket" section is NOT visible
- **Expected Result:** Only Conversation section rendered; Ticket section hidden entirely
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-004 — Each result displays `Matched by` with the attribute key
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-021–FR-023
- **Pre-condition:** At least one search result returned for a business identifier
- **Steps:**
  1. Open search popup and search for a known identifier (e.g. `AWB-1234`)
  2. For each result card in the popup, verify a "Matched by" label is present
  3. Verify the label shows the attribute key (e.g. "AWB", "Order ID", "Tracking Number")
- **Expected Result:** Every result card displays "Matched by" with the correct attribute key that caused the match
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-005 — Each result displays `Matched value` with normalized value
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-022
- **Pre-condition:** At least one search result returned
- **Steps:**
  1. Open search popup and search for a known identifier
  2. For each result card, verify a "Matched value" label is present
  3. Verify the value shown is the normalized or display-safe representation of the matched value
- **Expected Result:** "Matched value" displayed on every result card; value is normalized and safe for display
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-006 — Multiple qualifying fields → only highest-priority match reason displayed
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-023, EC-002
- **Pre-condition:** A record has multiple fields that match the search query (e.g. both AWB and Tracking Number contain the same value)
- **Steps:**
  1. Open search popup and search for the shared value
  2. Locate the result that matches on multiple fields
  3. Verify only ONE "Matched by" key is shown (the highest-priority one)
  4. Verify no duplicate or secondary match reason is displayed
- **Expected Result:** Only the highest-priority match reason displayed; lower-priority matches suppressed
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-007 — Clicking a Conversation result opens Conversation Room and closes popup
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-027, FR-029
- **Pre-condition:** Search popup has at least one Conversation result
- **Steps:**
  1. Open search popup and search for a known identifier
  2. Click on a Conversation result row
  3. Verify popup closes
  4. Verify Conversation Room opens (`Chat-Room-Container` visible)
  5. Verify `[data-cy="Chat-Room-Header-Contact-Name"]` shows correct contact
- **Expected Result:** Clicking Conversation result navigates to Conversation Room; popup dismissed
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-008 — Clicking a Ticket result opens Ticket Detail and closes popup
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-028, FR-029
- **Pre-condition:** Search popup has at least one Ticket result
- **Steps:**
  1. Open search popup and search for a known identifier
  2. Click on a Ticket result row
  3. Verify popup closes
  4. Verify Ticket Detail page opens
- **Expected Result:** Clicking Ticket result navigates to Ticket Detail; popup dismissed
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-009 — Reopening popup restores last keyword and results from session state
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-030
- **Pre-condition:** Agent has previously searched in this session
- **Steps:**
  1. Open search popup via `Ctrl+K`, search for `AWB-1234`, verify results shown
  2. Close popup (press `Esc` or click outside)
  3. Reopen popup via `Ctrl+K`
  4. Verify search input still contains `AWB-1234`
  5. Verify previous results are restored (no re-fetch needed)
- **Expected Result:** Session state preserved; last keyword and results restored on reopen
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-010 — Clicking Cari in sidenav opens centered popup modal
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-001–FR-002
- **Pre-condition:** Agent logged in, on any page
- **Steps:**
  1. Click "Cari" button in sidenav
  2. Verify centered popup modal appears above current page
  3. Verify popup has search input field
  4. Verify popup overlays current page (background dimmed or blurred)
- **Expected Result:** Popup modal opens centered above current page; input ready for typing
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-011 — Pressing Ctrl+K/Cmd+K opens popup with input auto-focused
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-003
- **Pre-condition:** Agent logged in, on any page
- **Steps:**
  1. Press `Ctrl+K` (Windows) or `Cmd+K` (Mac)
  2. Verify centered popup modal appears
  3. Verify search input is auto-focused (cursor blinking, can type immediately)
  4. Press `Esc` — verify popup closes
- **Expected Result:** Keyboard shortcut opens search popup with input auto-focused
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-012 — Agent with scoped access sees only allowed records
- **Type:** Permission | **Priority:** P0 | **Source:** US-005, FR-005–FR-006, EH-005
- **Pre-condition:** Agent has RBAC-scoped access (e.g. Team A only); Tickets and Conversations exist across multiple teams
- **Steps:**
  1. Login as scoped agent
  2. Open search popup and search for a known identifier
  3. Verify only results from accessible teams/domains are shown
  4. Verify out-of-scope records are silently excluded (no error, no placeholder)
- **Expected Result:** Scoped agent sees only permitted results; out-of-scope records silently excluded
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-013 — Search query is tenant-scoped; no cross-tenant leakage
- **Type:** Permission | **Priority:** P0 | **Source:** FR-006
- **Pre-condition:** Multi-tenant environment; Tenant A and Tenant B both have data
- **Steps:**
  1. Login as Tenant A agent
  2. Search for an identifier that exists only in Tenant B
  3. Verify no results returned (or only Tenant A matches)
  4. Verify network request includes correct `companyId` / `organizationId`
- **Expected Result:** Search scoped to current tenant; no cross-tenant data leakage
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-014 — Loading state shows "Mencari..." while request in flight
- **Type:** State | **Priority:** P0 | **Source:** US-006, FR-034
- **Pre-condition:** Agent opens search popup
- **Steps:**
  1. Open search popup via `Ctrl+K`
  2. Type a search keyword and press Enter or wait for debounce
  3. Verify "Mencari..." loading indicator appears while request is in flight
  4. Verify loading indicator disappears when results load
- **Expected Result:** "Mencari..." shown during search; replaced by results or empty state on completion
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-015 — Empty state shows "Tidak ada data terkait ditemukan."
- **Type:** State | **Priority:** P0 | **Source:** US-006, FR-035
- **Pre-condition:** Search keyword yields no matches in either domain
- **Steps:**
  1. Open search popup and type a non-existent identifier (e.g. `ZZZ-NONEXISTENT-999`)
  2. Wait for search to complete
  3. Verify empty state message: "Tidak ada data terkait ditemukan."
  4. Verify no section headers visible (no empty "Tiket" or "Percakapan" sections)
- **Expected Result:** Empty state message displayed; no stale or partial sections
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-016 — Ticket search fails but Conversation succeeds → partial retry
- **Type:** Negative | **Priority:** P0 | **Source:** US-006, FR-036, FR-037, EH-002
- **Pre-condition:** Ticket search service is down or returns 5xx; Conversation service is healthy
- **Steps:**
  1. Simulate Ticket search failure (e.g. mock 500 or kill Ticket search service)
  2. Open search popup and search for a known identifier
  3. Verify Conversation results load normally
  4. Verify Ticket section shows retry button labeled "Coba lagi"
  5. Click "Coba lagi" — verify Ticket search retries
- **Expected Result:** Conversation results visible; Ticket section shows "Coba lagi" retry; no full-page error
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-017 — Both domains fail → full error with retry
- **Type:** Negative | **Priority:** P0 | **Source:** EH-004
- **Pre-condition:** Both Ticket and Conversation search services are down
- **Steps:**
  1. Simulate both search services returning 5xx
  2. Open search popup and search
  3. Verify popup stays open (does not crash or close)
  4. Verify message: "Gagal memuat hasil pencarian. Coba lagi."
  5. Verify "Coba lagi" button is visible and functional
- **Expected Result:** Error message shown with retry option; popup remains stable
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-018 — Case and separator normalization treats values as same match
- **Type:** Edge | **Priority:** P0 | **Source:** FR-011–FR-013, EC-003
- **Pre-condition:** Record stored with AWB "AWB-1234"; another stored as "awb1234"
- **Steps:**
  1. Open search popup and search for `AWB-1234`
  2. Verify both records appear in results (one with stored value "AWB-1234", another with "awb1234")
  3. Search for `awb1234` — verify same two records appear
  4. Search for `AWB1234` — verify same two records appear
- **Expected Result:** Case and separator differences normalized; all variants match the same records
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-019 — Exact high-confidence matches rank above fallback results
- **Type:** Positive | **Priority:** P0 | **Source:** FR-031–FR-033
- **Pre-condition:** Search produces both exact matches and weaker/fallback matches
- **Steps:**
  1. Search for an identifier that has exact matches and partial matches
  2. Verify exact (normalized, high-confidence) matches appear first in each domain section
  3. Verify weaker/fallback results appear below exact matches
  4. For same-strength ties, verify sorting by most recently updated
- **Expected Result:** Results ranked by match confidence; ties broken by recency
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-020 — Phase 1 search does NOT mutate data or auto-create tags
- **Type:** Regression | **Priority:** P0 | **Source:** FR-014–FR-016
- **Pre-condition:** Agent performs multiple searches
- **Steps:**
  1. Record current state of a known Ticket (fields, tags, status)
  2. Record current state of a known Conversation (fields, tags, attributes)
  3. Open search popup and search for identifiers matching both records
  4. Open and click through results
  5. Re-check both records — verify no fields modified, no tags auto-created, no status changes
- **Expected Result:** Zero data mutation from search; no auto-tags created; Phase 1 is read-only
- **Actual Result:** *(QA fills)*

---

# 2. SC-SHAREATTR: Actionable Shared Attribute Search & System Relation Labels

> **Status:** UNKNOWN — verify against FE/BE
> **PRD:** `PRD/Conversationv2/PRD - Actionable Shared Attribute Search and System Relation Labels.md`
> **Surface:** Search popup + per-domain checkbox selection + bulk action bar + relation label chips

---

### SC-SHAREATTR-001 — Clicking Conversation result opens Conversation Room with Detail panel
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-003
- **Pre-condition:** Search popup has at least one Conversation result
- **Steps:**
  1. Open search popup (`Ctrl+K`) and search for a known identifier
  2. Click on a Conversation result row
  3. Verify popup closes
  4. Verify Conversation Room opens (`Chat-Room-Container` visible)
  5. Verify Detail panel is visible (`Chat-Detail-Title` present)
- **Expected Result:** Conversation Room opens with Detail panel visible; popup dismissed
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-002 — Clicking Ticket result opens Ticket Detail and closes popup
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-002, FR-003
- **Pre-condition:** Search popup has at least one Ticket result
- **Steps:**
  1. Open search popup and search for a known identifier
  2. Click on a Ticket result row
  3. Verify popup closes
  4. Verify Ticket Detail page opens
- **Expected Result:** Ticket Detail page opens; popup dismissed
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-003 — Checkbox selection of multiple Conversation results shows Conversation bulk action bar
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-005, FR-008, FR-010
- **Pre-condition:** Search popup has ≥2 Conversation results
- **Steps:**
  1. Open search popup and search for an identifier with multiple Conversation matches
  2. Click checkbox on first Conversation result
  3. Click checkbox on second Conversation result
  4. Verify Conversation bulk action bar appears at bottom/top of popup
  5. Verify action bar shows Conversation-specific actions (e.g. "Beri Tag Relasi Otomatis")
- **Expected Result:** Selecting ≥2 Conversation results shows Conversation bulk action bar with domain-specific actions
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-004 — Checkbox selection of multiple Ticket results shows Ticket bulk action bar
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-005, FR-008, FR-011
- **Pre-condition:** Search popup has ≥2 Ticket results
- **Steps:**
  1. Open search popup and search for an identifier with multiple Ticket matches
  2. Select checkboxes on ≥2 Ticket results
  3. Verify Ticket bulk action bar appears separately from Conversation bar (if any)
  4. Verify action bar shows Ticket-specific actions
- **Expected Result:** Ticket bulk action bar appears with Ticket-specific actions; separate from Conversation bar
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-005 — Selecting both Conversation and Ticket results shows two separate action bars
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, FR-006–FR-007, EH-004
- **Pre-condition:** Search popup has both Conversation and Ticket results
- **Steps:**
  1. Search for an identifier that returns both domains
  2. Select ≥1 Conversation result and ≥1 Ticket result
  3. Verify two separate domain-specific action bars are shown
  4. Verify NO mixed-domain bulk execution option exists
  5. Verify executing action on one domain does not affect the other domain's selection
- **Expected Result:** Two separate action bars; no cross-domain bulk execution; selections independent
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-006 — "Beri Tag Relasi Otomatis" applies system relation label to selected records
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-012
- **Pre-condition:** Conversation results selected with checkbox; shared attribute context available
- **Steps:**
  1. Select ≥1 Conversation results via checkbox
  2. Click "Beri Tag Relasi Otomatis" in the bulk action bar
  3. Verify action completes (success toast or indicator)
  4. Open one of the selected conversations
  5. Verify relation label chip appears in the conversation detail/tag area
- **Expected Result:** System relation label applied to all selected records based on shared attribute context
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-007 — Applying same relation label to record that already has it is idempotent
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-015, FR-021, EH-002
- **Pre-condition:** Conversation already has relation label "AWB • JNE123456789"
- **Steps:**
  1. Select the conversation that already has the relation label
  2. Click "Beri Tag Relasi Otomatis" again for the same attribute
  3. Verify no duplicate label created
  4. Verify label count remains 1 for that relation
- **Expected Result:** Idempotent — no duplicate relation label; existing label preserved
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-008 — Generated label displays readable format "AWB • JNE123456789"
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-019
- **Pre-condition:** Relation label applied to a conversation via shared attribute
- **Steps:**
  1. Apply relation label via "Beri Tag Relasi Otomatis"
  2. Locate the label chip in conversation detail
  3. Verify format is "{Attribute Key} • {Attribute Value}" (e.g. "AWB • JNE123456789")
  4. Verify label is human-readable (no raw IDs or encoded values)
- **Expected Result:** Label displays in readable format: "AWB • JNE123456789"
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-009 — Relation labels stored separately from manual tag registry
- **Type:** Positive | **Priority:** P0 | **Source:** FR-016, FR-022, US-007
- **Pre-condition:** Relation label applied to at least one conversation
- **Steps:**
  1. Navigate to Settings → Tag Management (or equivalent tag admin page)
  2. Search for the relation label value (e.g. "JNE123456789")
  3. Verify the relation label does NOT appear as an editable manual tag
  4. Verify relation labels are only visible in the conversation detail context, not in the global tag registry
- **Expected Result:** Relation labels isolated from manual tag registry; not editable in Tag Management
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-010 — Relation label chip has distinct visual style from manual tag chip
- **Type:** Positive | **Priority:** P0 | **Source:** FR-022
- **Pre-condition:** Conversation has both a manual tag and a relation label
- **Steps:**
  1. Open conversation with both a manual tag and a relation label
  2. Locate both chips in the detail/tag area
  3. Verify visual distinction (different color, icon, border style, or prefix)
  4. Verify relation label chip has identifiable "system" styling
- **Expected Result:** Relation label chip visually distinct from manual tag chip
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-011 — Clicking relation filter shortcut narrows results to that relation value
- **Type:** Positive | **Priority:** P1 | **Source:** US-006, FR-023
- **Pre-condition:** Relation label chip visible in search results or conversation detail
- **Steps:**
  1. Locate a relation label chip (e.g. "AWB • JNE123456789")
  2. Click on the chip to activate relation filter
  3. Verify current result list narrows to only records with that relation value
  4. Verify filter indicator is visible (e.g. "Filter: AWB • JNE123456789")
- **Expected Result:** Relation filter narrows view to matching records; filter indicator shown
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-012 — No matching records under relation filter shows clear empty state
- **Type:** State | **Priority:** P1 | **Source:** US-006
- **Pre-condition:** Relation filter activated for a value that has no other matching records
- **Steps:**
  1. Activate relation filter for a relation value
  2. Verify if no other records match, an empty state message is shown
  3. Verify empty state is clear and non-error (e.g. "Tidak ada data terkait")
- **Expected Result:** Clear empty state when no records match relation filter
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-013 — Bulk action with zero selected records: action button disabled
- **Type:** Negative | **Priority:** P0 | **Source:** EH-003
- **Pre-condition:** Search results visible but no checkboxes selected
- **Steps:**
  1. Open search popup and get results
  2. Verify bulk action bar is NOT visible or action buttons are disabled
  3. Select one record — verify buttons become enabled
  4. Deselect — verify buttons disabled again
- **Expected Result:** Bulk action buttons disabled when zero records selected; enabled on selection
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-014 — Partial bulk apply: successful mutations kept, partial outcome shown
- **Type:** Negative | **Priority:** P0 | **Source:** EH-005, FR-013–FR-014
- **Pre-condition:** Selection includes records where some will fail (e.g. permission denied on one)
- **Steps:**
  1. Select ≥3 results including one inaccessible record
  2. Click "Beri Tag Relasi Otomatis"
  3. Verify partial success message: "Sebagian label berhasil diterapkan."
  4. Verify successful records have the label applied
  5. Verify failed record is NOT mutated
- **Expected Result:** Successful mutations kept; partial outcome message shown; failed records untouched
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-015 — Inaccessible records in selection are skipped/blocked with audit
- **Type:** Permission | **Priority:** P0 | **Source:** FR-013–FR-014, EH-001
- **Pre-condition:** Agent selects records including some outside their RBAC scope
- **Steps:**
  1. Select results including an out-of-scope record
  2. Execute bulk action
  3. Verify inaccessible record is skipped (not mutated silently)
  4. Verify audit log records the skip with reason
- **Expected Result:** Inaccessible records blocked, not mutated; audit trail records skip
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-016 — Changing search keyword clears previous selection state
- **Type:** Edge | **Priority:** P0 | **Source:** FR-009, EC-005
- **Pre-condition:** Agent has selected records in search popup
- **Steps:**
  1. Open search popup, search for "AWB-1234", select ≥1 results
  2. Change search keyword to "ORD-5555"
  3. Verify previous checkbox selections are cleared
  4. Verify bulk action bar disappears (no selection = no bar)
- **Expected Result:** New search clears previous selection state; fresh results with no pre-selection
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-017 — Existing Auto Tag rules NOT changed by this feature
- **Type:** Regression | **Priority:** P0 | **Source:** FR-026, US-007
- **Pre-condition:** Workspace has existing Auto Tag rules configured
- **Steps:**
  1. Record current Auto Tag rules (list, conditions, actions)
  2. Perform multiple shared-attribute searches and apply relation labels
  3. Re-check Auto Tag rules — verify no rules added, modified, or deleted
  4. Verify relation label operations do not trigger Auto Tag rule execution
- **Expected Result:** Auto Tag rules unchanged; no mutation from relation label feature
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-018 — Long display values (50+ chars) truncated safely in chip
- **Type:** Edge | **Priority:** P1 | **Source:** EC-003
- **Pre-condition:** A shared attribute value is 50+ characters long
- **Steps:**
  1. Apply relation label with a long attribute value (e.g. 60-char tracking number)
  2. Verify chip text is truncated (e.g. "AWB • ABCDEF1234567890..." with ellipsis)
  3. Hover over chip — verify full value accessible via tooltip
  4. Verify chip does not break layout (no overflow)
- **Expected Result:** Long values truncated with ellipsis in chip; full value on hover; no layout break
- **Actual Result:** *(QA fills)*

---

# 3. SC-SHOPEE: Omnichannel Inbox — Shopee Channel Add-On

> **Status:** UNKNOWN — verify against FE/BE
> **PRD:** `PRD/Conversationv2/PRD - Omnichannel Inbox - Shopee Channel Add-On.md`
> **Surface:** Settings → Add-On → Shopee + Inbox chat list + Conversation Room

---

### SC-SHOPEE-001 — Admin activates Shopee add-on and completes connect flow
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001–FR-004
- **Pre-condition:** Admin logged in; Shopee add-on available but not yet activated
- **Steps:**
  1. Navigate to Settings → Add-On → Shopee
  2. Click "Aktifkan" or equivalent activation button
  3. Complete Shopee OAuth/authorization flow (enter valid Shopee seller credentials)
  4. Verify redirect back to SatuInbox with success confirmation
  5. Verify account channel "Shopee" created in correct tenant scope
- **Expected Result:** Shopee add-on activated; account channel created under correct tenant
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-002 — Invalid credentials: no account channel created, safe failure reason
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-002
- **Pre-condition:** Admin on Shopee connect flow
- **Steps:**
  1. Navigate to Settings → Add-On → Shopee → Connect
  2. Enter invalid Shopee credentials or deny authorization
  3. Verify no account channel is created
  4. Verify safe failure reason displayed (e.g. "Kredensial tidak valid" or Shopee error message)
  5. Verify Settings page does not show Shopee as connected
- **Expected Result:** Failed connection; no account channel created; clear failure message shown
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-003 — Settings page shows connected Shopee with "terhubung" status
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-009
- **Pre-condition:** Shopee successfully connected
- **Steps:**
  1. Navigate to Settings → Add-On → Shopee
  2. Verify connected Shopee account channel listed
  3. Verify status shows "terhubung" (connected)
  4. Verify account/shop name displayed
- **Expected Result:** Shopee account channel visible with "terhubung" status and shop name
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-004 — Valid inbound Shopee webhook creates/updates conversation in inbox
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-015, FR-022–FR-024
- **Pre-condition:** Shopee connected; buyer sends message from Shopee chat
- **Steps:**
  1. Send a test message from Shopee buyer account to connected seller
  2. Wait for webhook processing (≤30s)
  3. Navigate to Inbox (`/id/conversation/your-inbox`)
  4. Verify new conversation appears in chat list
  5. Verify `[data-cy="chat-list-1-channel-icon"]` shows Shopee icon
  6. Open conversation — verify message content matches Shopee message
- **Expected Result:** Inbound Shopee message creates conversation in inbox; channel icon shows Shopee
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-005 — Same buyer continuation on same thread appended to existing conversation
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-024
- **Pre-condition:** Existing Shopee conversation from a buyer
- **Steps:**
  1. Send a second message from the same Shopee buyer on the same thread
  2. Wait for webhook processing
  3. Navigate to the existing Shopee conversation
  4. Verify new message appended (not a new conversation created)
  5. Verify conversation count in inbox unchanged (no duplicate row)
- **Expected Result:** Continuation message appended to existing conversation; no duplicate
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-006 — Duplicate webhook retry: no duplicate conversation or message (idempotent)
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-056–FR-057, EC-001
- **Pre-condition:** Shopee connected; webhook can be replayed
- **Steps:**
  1. Record current conversation count and message count for a Shopee conversation
  2. Replay/duplicate the same webhook payload (same event/message ID)
  3. Verify no new conversation created
  4. Verify no duplicate message in timeline
  5. Verify message count unchanged
- **Expected Result:** Idempotent — duplicate webhook ignored; no duplicate data created
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-007 — Invalid/unverifiable webhook payload: rejected, security log recorded
- **Type:** Negative | **Priority:** P0 | **Source:** FR-012–FR-014, EH-003
- **Pre-condition:** Ability to send malformed webhook requests
- **Steps:**
  1. Send webhook with invalid signature (tampered payload)
  2. Verify request rejected (HTTP 400 or 401)
  3. Verify no conversation or message mutation
  4. Send webhook with missing required fields
  5. Verify rejected with appropriate error
  6. Check security/audit log for recorded event
- **Expected Result:** Invalid webhooks rejected; no data mutation; security event logged
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-008 — Agent sends outbound text reply to Shopee
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-032–FR-035
- **Pre-condition:** Agent has open Shopee conversation with send permission
- **Steps:**
  1. Open Shopee conversation in Conversation Room
  2. Verify composer is enabled (`Input-Area-Container` visible, not `Input-Area-Disabled`)
  3. Type message in `[data-cy="Message-Text-Input"]`
  4. Click `[data-cy="Send-Button"]`
  5. Verify message appears in timeline as sent
  6. Verify message delivered to Shopee (check Shopee buyer side or provider confirmation)
- **Expected Result:** Outbound text reply sent to Shopee; stored in timeline with sent status
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-009 — Outbound send fails with provider failure: message marked failed
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-009, FR-035
- **Pre-condition:** Shopee provider returns failure (e.g. rate limit or API error)
- **Steps:**
  1. Simulate Shopee provider failure (mock API error)
  2. Send message from composer
  3. Verify message marked as "failed" in timeline (red indicator or error icon)
  4. Verify agent sees error: "Pesan gagal dikirim ke Shopee"
  5. Verify retry option available if applicable
- **Expected Result:** Failed message clearly marked; agent sees "Pesan gagal dikirim ke Shopee"
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-010 — Agent without send permission: composer disabled/hidden
- **Type:** Permission | **Priority:** P0 | **Source:** US-003, FR-050–FR-051, EH-011
- **Pre-condition:** Agent without Shopee send permission
- **Steps:**
  1. Login as agent without Shopee send permission
  2. Open a Shopee conversation
  3. Verify `[data-cy="Input-Area-Disabled"]` is visible OR composer is hidden
  4. Verify no `Send-Button` accessible
  5. Verify server-side enforcement (attempting API call directly returns 403)
- **Expected Result:** Composer disabled or hidden for agents without send permission; server-side enforced
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-011 — Account channel disconnected at outbound time: composer blocked
- **Type:** Negative | **Priority:** P0 | **Source:** EH-007, FR-036
- **Pre-condition:** Shopee account channel was disconnected after conversation opened
- **Steps:**
  1. Open an existing Shopee conversation
  2. Disconnect Shopee account channel from Settings (or simulate disconnection)
  3. Attempt to send a message
  4. Verify composer blocked with message: "Akun Shopee tidak terhubung"
  5. Verify message NOT sent to provider
- **Expected Result:** Composer blocked; "Akun Shopee tidak terhubung" message shown; no outbound attempted
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-012 — Shopee conversations show "Shopee" channel label in inbox list
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-042
- **Pre-condition:** Shopee conversations exist in inbox
- **Steps:**
  1. Navigate to Inbox (`/id/conversation/your-inbox`)
  2. Locate a Shopee conversation in chat list
  3. Verify `[data-cy="chat-list-N-channel-icon"]` shows Shopee icon/channel label
  4. Verify label distinguishes Shopee from WhatsApp, Live Chat, etc.
- **Expected Result:** Shopee conversations display "Shopee" channel label/icon in inbox list
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-013 — Channel filter includes Shopee; selecting it shows only Shopee conversations
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-043–FR-044
- **Pre-condition:** Inbox has conversations from multiple channels including Shopee
- **Steps:**
  1. Navigate to Inbox
  2. Click channel filter `[data-cy="chatList-filter-status"]` or channel filter
  3. Verify "Shopee" is listed as a filter option
  4. Select "Shopee"
  5. Verify only Shopee conversations displayed
  6. Verify conversation count matches expected Shopee count
- **Expected Result:** Shopee available in channel filter; selecting it filters to Shopee-only conversations
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-014 — Shopee conversations included in platform-level analytics
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-054
- **Pre-condition:** Shopee conversations exist with resolved/closed status
- **Steps:**
  1. Navigate to Analytics → Percakapan
  2. Verify "Shopee" appears in channel distribution donut chart
  3. Verify Shopee conversation count is included in KPI totals
  4. Apply channel filter for "Shopee" — verify analytics reflect Shopee-only data
- **Expected Result:** Shopee conversations included in all platform-level analytics and KPIs
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-015 — Authorization expiry/revoke: account marked disconnected, outbound blocked, audit logged
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-011, EH-002
- **Pre-condition:** Shopee account connected; authorization can be revoked
- **Steps:**
  1. Revoke Shopee authorization (via Shopee Seller Center or simulate token expiry)
  2. Navigate to Settings → Add-On → Shopee
  3. Verify account channel marked as "disconnected" or "kedaluwarsa"
  4. Open a Shopee conversation — verify composer blocked
  5. Check audit log for event "shopee_account_invalidated" with actor, tenant, timestamp
- **Expected Result:** Account marked disconnected; outbound blocked; "shopee_account_invalidated" audit event recorded
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-016 — Reconnect action succeeds: account returns to "connected", outbound restored
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-010
- **Pre-condition:** Shopee account previously disconnected or expired
- **Steps:**
  1. Navigate to Settings → Add-On → Shopee
  2. Click "Hubungkan kembali" or reconnect action
  3. Complete Shopee authorization flow
  4. Verify account channel returns to "terhubung" status
  5. Open a Shopee conversation — verify composer enabled
  6. Send a test message — verify sent successfully
- **Expected Result:** Reconnect restores "terhubung" status; outbound messaging restored
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-017 — Buyer identity resolved via channel-scoped external identity
- **Type:** Positive | **Priority:** P0 | **Source:** FR-018–FR-021, EH-005
- **Pre-condition:** Shopee buyer sends message; buyer has Shopee username
- **Steps:**
  1. Receive inbound Shopee message from a buyer
  2. Open the conversation in inbox
  3. Verify buyer identity shown is the Shopee-scoped external identity (not display name derived from message text)
  4. Verify same buyer sending from different thread still resolves to same contact
- **Expected Result:** Buyer identity resolved via channel-scoped external identity; consistent across threads
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-018 — Inbound for closed thread: follows canonical reopen/create policy
- **Type:** Edge | **Priority:** P0 | **Source:** EC-004, FR-026
- **Pre-condition:** Shopee conversation previously closed/resolved
- **Steps:**
  1. Close/resolve an existing Shopee conversation
  2. Buyer sends new message on the same Shopee thread
  3. Verify system follows canonical reopen/create policy (same as other channels)
  4. Verify no Shopee-specific status taxonomy introduced
- **Expected Result:** Canonical reopen/create behavior applied; no Shopee-specific status handling
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-019 — Unsupported non-text inbound: does not break text pipeline; logged
- **Type:** Edge | **Priority:** P0 | **Source:** FR-029–FR-031, EH-012, EC-009
- **Pre-condition:** Shopee sends a non-text message type (image, sticker, etc. — unsupported in Phase 1)
- **Steps:**
  1. Trigger non-text inbound from Shopee (e.g. image or sticker)
  2. Verify text pipeline continues to work (next text message still processed)
  3. Verify unsupported message logged for observability (not silently dropped)
  4. Verify no crash or error in conversation timeline
- **Expected Result:** Non-text messages do not break text pipeline; logged for observability; no crash
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-020 — Double-click outbound send: idempotency guard prevents double-send
- **Type:** Edge | **Priority:** P0 | **Source:** EC-006
- **Pre-condition:** Agent on Shopee conversation with message ready
- **Steps:**
  1. Type a message in composer
  2. Double-click (or rapidly click twice) the `[data-cy="Send-Button"]`
  3. Verify only ONE message sent to Shopee provider
  4. Verify only ONE message bubble appears in timeline
  5. Verify no duplicate message on Shopee buyer side
- **Expected Result:** Idempotency guard prevents double-send; exactly one message sent
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-021 — Status callbacks arrive out of order: reconciled deterministically
- **Type:** Edge | **Priority:** P0 | **Source:** FR-041, EC-005
- **Pre-condition:** Ability to simulate out-of-order status callbacks from Shopee
- **Steps:**
  1. Send a message to Shopee
  2. Simulate status callback "delivered" arriving before "sent" (out of order)
  3. Verify final message status is "delivered" (or the correct terminal state)
  4. Verify no terminal state regression (status never goes backward from delivered to sent)
- **Expected Result:** Out-of-order callbacks reconciled deterministically; no terminal state regression
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-022 — Tenant connects multiple Shopee shops: each becomes separate account channel
- **Type:** Positive | **Priority:** P1 | **Source:** FR-008, EC-002
- **Pre-condition:** Tenant has access to multiple Shopee seller accounts
- **Steps:**
  1. Connect first Shopee shop — verify account channel "Shopee - Shop A" created
  2. Connect second Shopee shop — verify account channel "Shopee - Shop B" created
  3. Verify both listed in Settings → Add-On → Shopee
  4. Send message to each shop's buyer — verify routed to correct account channel
  5. Verify Inbox shows conversations from both shops with correct account-channel identifier
- **Expected Result:** Multiple Shopee shops each become separate account channels within same tenant
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-023 — Connect/disconnect/inbound/outbound/failure events all have audit trail
- **Type:** Positive | **Priority:** P1 | **Source:** US-006, FR-052–FR-053
- **Pre-condition:** Shopee integration active; audit logging enabled
- **Steps:**
  1. Connect Shopee account — verify audit event with actor, tenant, account channel, timestamp
  2. Receive inbound message — verify audit event
  3. Send outbound reply — verify audit event
  4. Disconnect account — verify audit event
  5. Simulate failure (e.g. send with disconnected account) — verify audit event
  6. Verify all events include actor, tenant, account channel, and timestamp
- **Expected Result:** All lifecycle events audited with actor, tenant, account channel, timestamp
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-024 — Shopee uses existing Platform → Channel → AccountChannel model
- **Type:** Contract | **Priority:** P0 | **Source:** US-007, FR-003, FR-048
- **Pre-condition:** Shopee add-on activated
- **Steps:**
  1. Inspect API response for account channels (GET account-channels or equivalent)
  2. Verify Shopee follows existing Platform → Channel → AccountChannel hierarchy
  3. Verify no new entity model introduced (no "ShopeeShop" or custom model)
  4. Verify Shopee account channel has same fields as other channels (id, platform, channelType, status, tenantId)
- **Expected Result:** Shopee uses existing model; no new entity types; consistent with other channels
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-025 — Existing channels continue working without regression during Shopee pilot
- **Type:** Regression | **Priority:** P0 | **Source:** FR-056–FR-057 (cross-channel)
- **Pre-condition:** Shopee add-on active; other channels (WhatsApp API, Instagram, Live Chat, Email) also active
- **Steps:**
  1. Send and receive messages on WhatsApp API channel — verify works normally
  2. Send and receive messages on Instagram channel — verify works normally
  3. Send and receive messages on Live Chat — verify works normally
  4. Send and receive messages on Email — verify works normally
  5. Verify channel filters still work for all non-Shopee channels
  6. Verify analytics include all channels without data loss
- **Expected Result:** Zero regression on existing channels during Shopee pilot rollout
- **Actual Result:** *(QA fills)*
