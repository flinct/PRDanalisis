# Conversation Scenario Catalog — SC-MULTITKT & SC-MEMBERHUD (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07 · **Status:** DEVELOPED
> **PRD Sources:** `PRD/Conversationv2/PRD Ticket - Multi-Ticket Drafts from Single Chat Bubble.md`, `PRD/Conversationv2/PRD Ticket - Team Inbox Member Drawer and Online Status HUD.md`
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **Existing TC Ref:** `Test/conversation/Conversation.tsv`

---

## PRD Ticket - Multi-Ticket Drafts from Single Chat Bubble

### SC-MULTITKT-001 — Selecting exactly 1 bubble and clicking "Buat tiket" opens modal with 1 ticket draft
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-002, FR-003
- **Pre-condition:** Agent logged in, conversation open in Chat Room (`[data-cy="Chat-Room-Container"]`), at least 1 message bubble visible (`[data-cy="Message-Bubble"]`)
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox` and open a conversation
  2. Click on exactly 1 message bubble `[data-cy="Message-Bubble"]` to select it
  3. Click "Buat tiket" action button
  4. Verify `[data-cy="Create-Ticket-Modal"]` opens
  5. Verify modal contains exactly 1 draft form with Ticket Type, Title, Description fields
- **Expected Result:** Single-bubble multi-draft modal opens with 1 ticket draft; "Tambah tiket" button visible; draft count shows 1
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-002 — Clicking "Tambah tiket" appends a new numbered draft
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-005
- **Pre-condition:** Single-bubble multi-draft modal open with 1 draft
- **Steps:**
  1. Open single-bubble multi-draft modal (per SC-MULTITKT-001)
  2. Click "Tambah tiket" button
  3. Verify a new numbered draft form is appended (e.g., "Tiket 2")
  4. Verify draft count in header updates to 2
  5. Click "Tambah tiket" again — verify 3rd draft appended with correct numbering
- **Expected Result:** Each click appends a new sequentially numbered draft; draft count increments; each draft is independently editable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-003 — Removing a draft reindexes remaining drafts; at least 1 draft always remains
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-006
- **Pre-condition:** Modal open with ≥2 drafts
- **Steps:**
  1. Open single-bubble modal and add 3 drafts (Tiket 1, Tiket 2, Tiket 3)
  2. Click "Hapus" on draft 2
  3. Verify remaining drafts reindex: "Tiket 1" and "Tiket 2" (former 3 becomes 2)
  4. Attempt to remove the last remaining draft
  5. Verify removal is blocked — at least 1 draft always present
- **Expected Result:** Removed draft disappears; remaining drafts reindex sequentially; last draft cannot be removed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-004 — Submitting all valid drafts creates 1 ticket per draft; each linked to selected bubble
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-009, FR-010
- **Pre-condition:** Modal open with 2 drafts, all required fields filled
- **Steps:**
  1. Fill Draft 1: Ticket Type = "Refund", Title = "Cek AWB 123" (min 5 chars), optional Description
  2. Fill Draft 2: Ticket Type = "Complaint", Title = "Keluhan pengiriman"
  3. Click "Buat semua tiket" submit button
  4. Verify success state shows 2 created ticket identifiers
  5. Verify each ticket has linked message reference to the selected bubble
- **Expected Result:** 2 tickets created; each linked to the same selected bubble message; success summary shows ticket IDs
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-005 — Submit blocked when any draft invalid; each invalid draft shows field errors + top summary
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-013, FR-014, EH-001
- **Pre-condition:** Modal open with 2 drafts; Draft 2 has empty Title
- **Steps:**
  1. Fill Draft 1 with all required fields
  2. Leave Draft 2 Title empty (required field)
  3. Click "Buat semua tiket"
  4. Verify submit is blocked
  5. Verify Draft 2 shows inline field error on Title
  6. Verify top summary "Ada data tiket yang belum lengkap" is displayed
- **Expected Result:** Submit blocked; inline errors on invalid fields; top error summary "Ada data tiket yang belum lengkap" shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-006 — Draft auto-saved to cookies after 1 second of inactivity per field change
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-017
- **Pre-condition:** Modal open with 1 draft
- **Steps:**
  1. Open single-bubble modal
  2. Type a title in Draft 1 Title field
  3. Stop typing and wait 1 second
  4. Verify cookie is written (check browser DevTools > Application > Cookies for draft key)
  5. Edit another field, wait 1 second, verify cookie updated
- **Expected Result:** Cookie auto-saved after 1s inactivity per field change; cookie key includes workspace, user, conversation, message context
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-007 — Closing modal or refreshing page; reopening "Buat tiket" on same bubble restores drafts with banner
- **Type:** Positive | **Priority:** P0 | **Source:** US-002
- **Pre-condition:** Drafts auto-saved to cookies (per SC-MULTITKT-006)
- **Steps:**
  1. Create 2 drafts with filled fields, wait for cookie save
  2. Close the modal (click `[data-cy="Create-Ticket-Cancel-Button"]`)
  3. Select the same bubble again and click "Buat tiket"
  4. Verify "Draft dipulihkan" banner is shown
  5. Verify both drafts restored with previously entered data
- **Expected Result:** Restored drafts show "Draft dipulihkan" banner; all previously entered field values intact
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-008 — Clicking "Buang draft" clears all drafts and resets modal to 1 empty draft
- **Type:** Positive | **Priority:** P0 | **Source:** US-002
- **Pre-condition:** Restored drafts visible with "Draft dipulihkan" banner
- **Steps:**
  1. Open modal with restored drafts (per SC-MULTITKT-007)
  2. Click "Buang draft" button
  3. Verify all drafts cleared
  4. Verify modal resets to 1 empty draft form
  5. Verify "Draft dipulihkan" banner disappears
- **Expected Result:** All drafts cleared; modal resets to single empty draft; cookie deleted for this bubble
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-009 — Draft cookies deleted after successful ticket creation
- **Type:** Positive | **Priority:** P0 | **Source:** US-002
- **Pre-condition:** Drafts with filled data, cookie persisted
- **Steps:**
  1. Fill drafts and submit successfully (all valid)
  2. Verify success state shown
  3. Check browser cookies — verify draft cookie for this bubble is deleted
  4. Close modal, select same bubble, click "Buat tiket"
  5. Verify no "Draft dipulihkan" banner; modal opens with fresh empty draft
- **Expected Result:** Draft cookies deleted after successful creation; reopening modal shows no restored drafts
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-010 — Selecting 2+ bubbles and clicking "Buat tiket" opens batch UI with 1 form per bubble; "Tambah tiket" hidden
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-004
- **Pre-condition:** Conversation open with ≥2 message bubbles visible
- **Steps:**
  1. Multi-select 2 message bubbles (checkbox/shift-click)
  2. Click "Buat tiket"
  3. Verify batch create UI opens with exactly 2 forms (1 per bubble)
  4. Verify "Tambah tiket" button is NOT visible
  5. Verify each form is labeled/correlated to its source bubble
- **Expected Result:** Multi-select mode opens batch UI; 1 form per selected bubble; "Tambah tiket" hidden; no multi-draft controls
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-011 — Multi-select submit creates N tickets for N bubbles; each links only to its corresponding bubble
- **Type:** Positive | **Priority:** P0 | **Source:** US-003
- **Pre-condition:** Batch create modal open with 3 bubbles selected, all forms filled
- **Steps:**
  1. Fill all 3 forms with valid ticket data
  2. Click submit
  3. Verify 3 tickets created
  4. Verify Ticket 1 links to Bubble 1 only, Ticket 2 to Bubble 2, Ticket 3 to Bubble 3
  5. Verify success summary shows 3 ticket IDs
- **Expected Result:** N tickets created for N bubbles; each ticket linked only to its corresponding source bubble
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-012 — Deselecting bubbles until 1 remains switches modal to single-bubble mode and shows "Tambah tiket"
- **Type:** State | **Priority:** P0 | **Source:** US-003
- **Pre-condition:** Batch create modal open with 2+ bubbles selected
- **Steps:**
  1. Open batch modal with 3 bubbles selected
  2. Deselect bubbles until only 1 remains
  3. Verify modal switches to single-bubble mode
  4. Verify "Tambah tiket" button appears
  5. Verify header subtitle shows "Mode 1 pesan"
- **Expected Result:** Modal transitions to single-bubble multi-draft mode; "Tambah tiket" shown; multi-draft controls enabled
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-013 — Bubble shows badge "Tiket: X" when tickets linked
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-022
- **Pre-condition:** At least 1 ticket created from a bubble
- **Steps:**
  1. Create 2 tickets from a single bubble (per SC-MULTITKT-004)
  2. Return to conversation room
  3. Locate the source bubble
  4. Verify badge "Tiket: 2" is displayed on the bubble (`[data-cy="ticket-badge"]`)
- **Expected Result:** Bubble displays "Tiket: X" badge reflecting number of linked tickets
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-014 — Clicking "Tiket: X" shows list of linked tickets; each opens
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-023
- **Pre-condition:** Bubble with linked tickets badge visible
- **Steps:**
  1. Click the "Tiket: 2" badge on the bubble
  2. Verify a popover/list appears with 2 linked ticket items
  3. Click on first ticket item
  4. Verify ticket detail page opens
  5. Go back, click second ticket — verify it opens correctly
- **Expected Result:** Badge click shows linked ticket list; each ticket item navigates to its ticket detail
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-015 — Adding 20 drafts blocks "Tambah tiket" and shows max limit message
- **Type:** Negative | **Priority:** P0 | **Source:** EC-001
- **Pre-condition:** Modal open with ability to add drafts
- **Steps:**
  1. Open single-bubble modal
  2. Click "Tambah tiket" repeatedly until 20 drafts exist
  3. Verify draft count shows 20
  4. Attempt to click "Tambah tiket" again
  5. Verify "Tambah tiket" is disabled
  6. Verify message "Maksimal 20 tiket dalam sekali proses" appears
- **Expected Result:** "Tambah tiket" disabled at 20 drafts; "Maksimal 20 tiket dalam sekali proses" shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-016 — Drafts isolated per bubble; opening drafts for two different bubbles does not mix
- **Type:** Edge | **Priority:** P0 | **Source:** EC-002
- **Pre-condition:** Two different bubbles with drafts saved
- **Steps:**
  1. Open modal for Bubble A, add 2 drafts with specific titles, wait for cookie save
  2. Close modal
  3. Open modal for Bubble B, add 1 draft with different title, wait for cookie save
  4. Close modal
  5. Reopen modal for Bubble A — verify 2 drafts with Bubble A data restored
  6. Reopen modal for Bubble B — verify 1 draft with Bubble B data restored
- **Expected Result:** Each bubble's drafts are fully isolated; no cross-contamination of draft data
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-017 — Editing drafts in two tabs: last save wins; restored state may show "Draft diperbarui"
- **Type:** Edge | **Priority:** P1 | **Source:** EC-003
- **Pre-condition:** Same bubble, two browser tabs open
- **Steps:**
  1. Open modal for Bubble A in Tab 1, type "Title A"
  2. Open modal for Bubble A in Tab 2, type "Title B" (different value)
  3. Wait for cookie save in Tab 2 (last write)
  4. Close both tabs, reopen modal for Bubble A
  5. Verify restored state shows "Title B" (last save wins)
  6. Verify "Draft diperbarui" banner shown
- **Expected Result:** Last cookie write wins; "Draft diperbarui" shown when restored state differs from last visible state
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-018 — Cookie size limit exceeded stops auto-save and warns
- **Type:** Negative | **Priority:** P1 | **Source:** EC-004
- **Pre-condition:** Modal with drafts approaching 3000-char cookie payload limit
- **Steps:**
  1. Open modal and add multiple drafts with very long descriptions (approaching 3000 char total)
  2. Continue editing until cookie payload exceeds 3000 characters
  3. Verify auto-save stops
  4. Verify warning "Draft terlalu besar untuk disimpan otomatis" appears
  5. Verify modal state is NOT cleared — drafts remain editable
- **Expected Result:** Auto-save stops; warning shown; modal state preserved; user can continue editing
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-019 — Network timeout keeps drafts; shows error + retry button
- **Type:** Negative | **Priority:** P0 | **Source:** EH-003
- **Pre-condition:** Modal open with valid drafts; network disconnected
- **Steps:**
  1. Fill 2 drafts with valid data
  2. Disconnect network (DevTools > Network > Offline)
  3. Click "Buat semua tiket"
  4. Verify error "Koneksi bermasalah. Coba lagi" shown
  5. Verify "Coba lagi" retry button visible
  6. Verify draft data is preserved (not cleared)
- **Expected Result:** Network timeout shows "Koneksi bermasalah. Coba lagi" with retry button; drafts preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-020 — Partial create failure shows per-draft status; retry button for failed drafts only
- **Type:** Negative | **Priority:** P0 | **Source:** EH-004, FR-015
- **Pre-condition:** Modal with 3 drafts; backend configured to fail draft 2
- **Steps:**
  1. Fill all 3 drafts with valid data
  2. Submit
  3. Verify Drafts 1 and 3 show success status
  4. Verify Draft 2 shows failure status
  5. Verify summary "Sebagian tiket gagal dibuat" shown
  6. Verify "Coba lagi untuk yang gagal" retry button visible
- **Expected Result:** Per-draft success/failure status shown; retry available for failed drafts only; summary "Sebagian tiket gagal dibuat"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-021 — Duplicate submit within 10 minutes ignored via idempotency key
- **Type:** Negative | **Priority:** P0 | **Source:** EH-007, FR-016
- **Pre-condition:** Modal with valid drafts
- **Steps:**
  1. Fill drafts and click "Buat semua tiket"
  2. Immediately click submit again within 10 minutes
  3. Verify second click is ignored
  4. Verify "Permintaan sedang diproses" message shown
  5. Verify only 1 set of tickets created (no duplicates)
- **Expected Result:** Duplicate submit ignored; "Permintaan sedang diproses" shown; idempotency key prevents duplicate ticket creation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-022 — Reference message unavailable blocks submit; shows error
- **Type:** Negative | **Priority:** P0 | **Source:** EH-006
- **Pre-condition:** Modal open; source bubble message deleted by another user
- **Steps:**
  1. Open modal and fill drafts
  2. Delete the source bubble message from another session/user
  3. Click "Buat semua tiket"
  4. Verify submit blocked
  5. Verify "Pesan referensi tidak tersedia" shown
  6. Verify "Tutup" button visible
- **Expected Result:** Submit blocked when reference message unavailable; "Pesan referensi tidak tersedia" shown with close option
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-023 — Cookie write failure shows banner warning
- **Type:** Negative | **Priority:** P1 | **Source:** EH-002
- **Pre-condition:** Browser blocks cookies (3rd-party cookie blocked or cookie storage full)
- **Steps:**
  1. Block cookies for the site (browser settings)
  2. Open single-bubble modal and edit a field
  3. Wait 1 second for auto-save attempt
  4. Verify banner "Draft gagal disimpan otomatis. Periksa pengaturan browser" shown
  5. Verify "Tutup" dismiss button on banner
  6. Verify modal remains functional (can still create tickets manually)
- **Expected Result:** Cookie write failure shows warning banner; creation flow continues normally; drafts not persisted
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-024 — Attachment fields not persisted in cookies; require re-attach after restore
- **Type:** Edge | **Priority:** P1 | **Source:** EC-007
- **Pre-condition:** Modal with draft that includes attachment
- **Steps:**
  1. Open modal, fill draft with text fields AND attach a file
  2. Wait for cookie save
  3. Close modal, reopen for same bubble
  4. Verify text fields restored
  5. Verify attachment NOT restored
  6. Verify message "Lampiran perlu diunggah ulang" shown in the draft
- **Expected Result:** Attachment not persisted in cookies; text fields restored; "Lampiran perlu diunggah ulang" message shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## PRD Ticket - Team Inbox Member Drawer and Online Status HUD

### SC-MEMBERHUD-001 — HUD shows `Anggota {n} • Online {m}` in Team Inbox header
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001
- **Pre-condition:** Agent logged in, Team Inbox selected with ≥3 members (2 online, 1 offline)
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Select a Team Inbox from sidebar (e.g., `[data-cy="team-1"]`)
  3. Verify Team Inbox header renders
  4. Verify HUD displays `Anggota 3 • Online 2`
  5. Verify HUD is clickable
- **Expected Result:** HUD shows correct member count and online count in format `Anggota {n} • Online {m}`
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-002 — Online count includes Active + Away; Active-to-Away transition does not change count
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-002
- **Pre-condition:** Team Inbox with 2 Active members
- **Steps:**
  1. Select Team Inbox, note HUD shows `Online 2`
  2. Change member 1 from Active to Away (e.g., idle timeout or manual status)
  3. Verify HUD still shows `Online 2` (Active 1 + Away 1 = 2)
  4. Verify count does not decrement
- **Expected Result:** Online count = Active + Away; transition Active→Away does not change count
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-003 — Presence unavailable: HUD shows `Online -`; Inbox remains usable
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-004
- **Pre-condition:** Presence service down or returning errors
- **Steps:**
  1. Simulate presence service unavailability (disconnect WebSocket or mock error)
  2. Select Team Inbox
  3. Verify HUD shows `Anggota {n} • Online -`
  4. Verify Inbox chat list still loads and is functional
  5. Verify no error toasts blocking usage
- **Expected Result:** HUD shows `Online -` as fallback; Inbox remains fully usable; no blocking errors
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-004 — Clicking HUD opens Member Drawer
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-005
- **Pre-condition:** HUD visible in Team Inbox header
- **Steps:**
  1. Select Team Inbox with members
  2. Click the HUD label (`Anggota {n} • Online {m}`)
  3. Verify Member Drawer opens (right-side drawer)
  4. Verify drawer title "Anggota tim" is shown
  5. Verify member list is loading or rendered
- **Expected Result:** Member Drawer opens showing member list with supervisors section, filters, search
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-005 — Presence updates in drawer refresh list and counts without page reload
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-013
- **Pre-condition:** Member Drawer open showing members
- **Steps:**
  1. Open Member Drawer for a Team Inbox with Active members
  2. Note a member's presence state (e.g., "Online")
  3. Change that member's status to Away (from another session/device)
  4. Verify drawer updates presence label to "Away" without page reload
  5. Verify HUD online count updates accordingly
- **Expected Result:** Real-time presence updates reflected in drawer list and HUD counts without page reload
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-006 — No Team Inbox access shows "Akses ditolak"; drawer does not open
- **Type:** Permission | **Priority:** P0 | **Source:** US-002, EH-001
- **Pre-condition:** User without access to specific Team Inbox
- **Steps:**
  1. Log in as user with no access to Team Inbox X
  2. Attempt to click HUD or open Member Drawer for Team Inbox X
  3. Verify "Akses ditolak" message shown
  4. Verify drawer does NOT open
  5. Verify user remains on Inbox page
- **Expected Result:** "Akses ditolak" shown; drawer blocked; user stays on Inbox
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-007 — Supervisors section appears at top of drawer listing supervisors first
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-007, FR-014
- **Pre-condition:** Team Inbox with 2 supervisors and 5 members
- **Steps:**
  1. Open Member Drawer for Team Inbox
  2. Verify "Supervisor" section appears at the top of the drawer
  3. Verify 2 supervisors listed in this section
  4. Verify regular members appear below the supervisors section
  5. Verify supervisors have "Supervisor" role badge
- **Expected Result:** Supervisors section at top; supervisors listed first; role badge visible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-008 — No supervisors shows "Belum ada supervisor"
- **Type:** Edge | **Priority:** P0 | **Source:** US-003
- **Pre-condition:** Team Inbox with 0 supervisors, ≥1 regular member
- **Steps:**
  1. Open Member Drawer for Team Inbox with no supervisors
  2. Verify "Supervisor" section renders
  3. Verify section shows "Belum ada supervisor"
  4. Verify regular members still listed below
- **Expected Result:** Supervisors section shows "Belum ada supervisor"; regular members unaffected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-009 — Search filters by name or email with 300ms debounce
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-012
- **Pre-condition:** Member Drawer open with ≥5 members
- **Steps:**
  1. Open Member Drawer
  2. Type a member name in search input (placeholder "Cari nama atau email")
  3. Verify results filter after 300ms debounce (not on every keystroke)
  4. Clear search, type partial email address
  5. Verify results filter by email match
  6. Verify search is case-insensitive
- **Expected Result:** Search filters by name or email; 300ms debounce; case-insensitive; max 100 chars
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-010 — Online filter shows only Active + Away members
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-010
- **Pre-condition:** Member Drawer with members in Active, Away, and Offline states
- **Steps:**
  1. Open Member Drawer
  2. Click "Online" filter tab
  3. Verify only Active and Away members shown
  4. Verify Offline members are hidden
  5. Verify supervisors section still shows supervisors who are Online
- **Expected Result:** Online filter shows only Active + Away members; Offline hidden
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-011 — Offline filter shows only Offline members
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-011
- **Pre-condition:** Member Drawer with members in various presence states
- **Steps:**
  1. Open Member Drawer
  2. Click "Offline" filter tab
  3. Verify only Offline members shown
  4. Verify Active and Away members are hidden
  5. Verify supervisors section shows only Offline supervisors
- **Expected Result:** Offline filter shows only Offline members; Active and Away hidden
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-012 — No results shows "Tidak ada hasil" and keeps search term
- **Type:** Edge | **Priority:** P0 | **Source:** US-004
- **Pre-condition:** Member Drawer open
- **Steps:**
  1. Open Member Drawer
  2. Type a non-existent name in search (e.g., "zzzznonexistent")
  3. Wait for debounce
  4. Verify "Tidak ada hasil" empty state shown
  5. Verify search term "zzzznonexistent" is still in the input field
- **Expected Result:** "Tidak ada hasil" shown; search term preserved in input
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-013 — "Tambah anggota" opens Add Member modal for existing users; multi-select up to 50
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-025, FR-026
- **Pre-condition:** User with manage membership permission; Member Drawer open
- **Steps:**
  1. Open Member Drawer as authorized user
  2. Click "Tambah anggota" button
  3. Verify "Tambah anggota ke tim" modal opens
  4. Verify user picker shows existing workspace users (not just team members)
  5. Select 3 users via multi-select
  6. Verify confirm button labeled "Tambahkan" is active
- **Expected Result:** Add Member modal opens; multi-select existing users; up to 50 per submission; "Tambahkan" / "Batal" buttons
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-014 — Already-member in picker disabled with "Anggota sudah terdaftar"
- **Type:** Negative | **Priority:** P0 | **Source:** US-005, EH-004
- **Pre-condition:** Add Member modal open; picker includes users already in team
- **Steps:**
  1. Open Add Member modal
  2. Search for a user already in the Team Inbox
  3. Verify that user's row is disabled in the picker
  4. Verify "Anggota sudah terdaftar" label on disabled row
  5. Verify row cannot be selected
- **Expected Result:** Existing members shown as disabled with "Anggota sudah terdaftar"; cannot be selected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-015 — No permission: "Tambah anggota" hidden or disabled
- **Type:** Permission | **Priority:** P0 | **Source:** US-005, FR-024
- **Pre-condition:** User without manage membership permission
- **Steps:**
  1. Log in as regular member (no manage membership permission)
  2. Open Member Drawer
  3. Verify "Tambah anggota" button is either hidden or disabled
  4. Verify no way to access Add Member modal
- **Expected Result:** "Tambah anggota" hidden or disabled for users without permission
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-016 — After successful add, drawer list and HUD counts update immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-028
- **Pre-condition:** Add Member modal with users selected
- **Steps:**
  1. Select 2 users in Add Member modal
  2. Click "Tambahkan"
  3. Verify modal closes
  4. Verify new members appear in drawer member list immediately
  5. Verify HUD "Anggota {n}" count increments by 2
  6. Verify "Online {m}" updates if new members are online
- **Expected Result:** Drawer list and HUD counts update immediately after successful add; no page reload needed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-017 — "Hapus dari tim" on member shows confirmation modal
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-031
- **Pre-condition:** Member Drawer open with authorized user
- **Steps:**
  1. Open Member Drawer as authorized user
  2. Click "Hapus dari tim" on a member row
  3. Verify confirmation modal "Hapus anggota?" opens
  4. Verify modal body: "User akan kehilangan akses ke Team Inbox ini."
  5. Verify "Hapus" and "Batal" buttons present
- **Expected Result:** Confirmation modal shows "Hapus anggota?" with warning text and Hapus/Batal buttons
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-018 — Confirming removal removes member and updates counts
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-033
- **Pre-condition:** Confirmation modal open for member removal
- **Steps:**
  1. In confirmation modal, click "Hapus"
  2. Verify modal closes
  3. Verify removed member disappears from drawer list
  4. Verify HUD "Anggota {n}" decrements by 1
  5. Verify "Online {m}" decrements if removed member was online
- **Expected Result:** Member removed; drawer list and HUD counts update immediately
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-019 — Removing last supervisor blocked with "Minimal 1 supervisor harus tetap ada"
- **Type:** Negative | **Priority:** P0 | **Source:** US-006, EH-006, FR-035
- **Pre-condition:** Team Inbox with exactly 1 supervisor
- **Steps:**
  1. Open Member Drawer for Team Inbox with 1 supervisor
  2. Click "Hapus dari tim" on the sole supervisor
  3. Confirm removal in modal
  4. Verify removal is blocked
  5. Verify "Minimal 1 supervisor harus tetap ada" message shown
  6. Verify supervisor remains in the list
- **Expected Result:** Removal blocked; "Minimal 1 supervisor harus tetap ada" shown; supervisor not removed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-020 — Removed member who was assignee has conversations auto-unassigned; action logged
- **Type:** State | **Priority:** P0 | **Source:** US-006, FR-036, FR-037
- **Pre-condition:** Member assigned to ≥2 conversations in this Team Inbox
- **Steps:**
  1. Note conversations assigned to target member
  2. Open Member Drawer, remove that member (per SC-MEMBERHUD-017/018)
  3. Verify removed member's conversations now show "Unassigned"
  4. Verify audit log entry `team_inbox.auto_unassign` created with removed user, team, and affected count
  5. Verify toast "Assignee diperbarui" or "Perubahan assignee sedang diproses" shown
- **Expected Result:** Auto-unassign sets assignee to null for affected conversations; audit logged; notification toast shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-021 — Away/Offline member with last seen shows relative time
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-020
- **Pre-condition:** Member Drawer with Away and Offline members who have last seen data
- **Steps:**
  1. Open Member Drawer
  2. Locate an Away member — verify last seen shows relative time (e.g., "5 menit lalu")
  3. Locate an Offline member — verify last seen shows relative time (e.g., "2 jam lalu")
  4. Verify format: 0-59s = "Baru saja", 1-59m = "{x} menit lalu", 1-23h = "{x} jam lalu", 1-30d = "{x} hari lalu", >30d = "Lebih dari 30 hari lalu"
- **Expected Result:** Relative last seen in Bahasa Indonesia format; correct thresholds per spec
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-022 — Active member last seen shows "Aktif sekarang"
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-021
- **Pre-condition:** Member Drawer with Active members
- **Steps:**
  1. Open Member Drawer
  2. Locate an Active member
  3. Verify last seen column shows "Aktif sekarang"
  4. Verify presence label shows "Online"
- **Expected Result:** Active members display "Aktif sekarang" as last seen value
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-023 — Last seen unavailable shows "-"
- **Type:** Edge | **Priority:** P0 | **Source:** US-007, FR-022
- **Pre-condition:** Member with no last seen data (e.g., newly added, or data unavailable)
- **Steps:**
  1. Add a new member to Team Inbox (per SC-MEMBERHUD-013)
  2. Open Member Drawer
  3. Locate the newly added member
  4. Verify last seen shows "-"
  5. Verify no error or broken layout
- **Expected Result:** Last seen shows "-" when unavailable; no UI breakage; actions still functional
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-024 — Team Inbox has 0 members: HUD shows "Anggota 0 • Online 0"; drawer shows "Belum ada anggota"
- **Type:** Edge | **Priority:** P0 | **Source:** EC-001
- **Pre-condition:** Team Inbox with 0 members (newly created or all removed)
- **Steps:**
  1. Select Team Inbox with 0 members
  2. Verify HUD shows "Anggota 0 • Online 0"
  3. Click HUD to open Member Drawer
  4. Verify drawer shows empty state "Belum ada anggota"
  5. Verify "Supervisor" section shows "Belum ada supervisor"
- **Expected Result:** HUD shows 0/0; drawer empty states for both members and supervisors; no errors
- **Actual Result:** *(QA fills)*
- **Existing TC:** —
