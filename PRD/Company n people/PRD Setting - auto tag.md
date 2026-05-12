# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Auto Tag System  
**Product Manager**: Yusril Ibnu  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-19 | Product | Initial PRD for Auto Tagging under Settings \> Tags Management \> Auto Tag |

---

## **2\. Overview**

Auto Tagging enables teams to automatically add tags to conversations and tickets when a message contains specific keywords or phrases. It is configured in Settings \> Tags Management \> Auto Tagging and uses existing Tag Management tags and visibility rules.

| In Scope | Out of Scope |
| ----- | ----- |
| Keyword or phrase based auto tagging. | Sentiment analysis, ML classification, embeddings. |
| Source selection: customer messages, agent messages. | Auto tag removal. |
| Agent content selection: outbound messages, internal notes, or both. | Regex rules, wildcard rules, complex boolean logic. |
| Scope selection: conversation, ticket, or both. | Frequency based tagging analytics. |
| Optional Team Inbox targeting with default All Team Inbox. | Retroactive backfill of existing historical messages. |
| Deduping when tags already exist. | Multi language stemming, advanced normalization. |

---

## **3\. Problem Statement**

| Problem | Impact |
| ----- | ----- |
| Teams manually tag high emotion or sensitive cases. | Inconsistent tagging and delayed escalation. |
| Keyword detection is done informally by agents. | Missed cases and noisy reporting. |
| Tags exist but there is no automation layer. | Low leverage of the existing Tag Management system. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Improve consistency of tagging for repeatable patterns. | \>= 90% of matched messages result in correct tags added. |
| Reduce manual effort for routine tagging. | \>= 30% reduction in manual tag additions for targeted use cases. |
| Keep configuration simple and user friendly. | Median time to create a rule \<= 60 seconds. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin or Supervisor, I want to create an Auto Tagging rule so that tags can be added automatically. | 1\. Given I open "Settings \> Tags Management \> Auto Tagging", When I click "Buat Rule", Then I see a form with required fields and clear helper text. 2\. Given the form has invalid or missing required values, When I click "Simpan", Then the system blocks save and shows inline error messages in Bahasa Indonesia. 3\. Given the form is valid, When I click "Simpan", Then the rule is created and I see toast "Rule berhasil disimpan". 4\. Given I lack permission, When I access the page, Then I see "Akses ditolak" and no create controls. |
| US-002 | P0 | As an Admin or Supervisor, I want to edit an Auto Tagging rule so that I can adjust keywords, source, or tags. | 1\. Given a rule exists, When I click "Edit", Then I see current values prefilled. 2\. Given I update fields with valid values, When I click "Simpan", Then changes apply immediately for new incoming messages. 3\. Given I input invalid values, When I click "Simpan", Then the system blocks and explains the issue. |
| US-003 | P0 | As an Admin or Supervisor, I want to delete an Auto Tagging rule so that I can stop unintended tagging. | 1\. Given a rule exists, When I click "Hapus", Then I see confirmation modal "Hapus rule ini?". 2\. Given I confirm, When deletion succeeds, Then the rule disappears from the list and I see "Rule berhasil dihapus". 3\. Given deletion fails, When the request returns error, Then the rule remains and I see "Gagal menghapus rule. Coba lagi". |
| US-004 | P0 | As an Admin or Supervisor, I want to control which message source triggers tagging so that rules match the intended workflow. | 1\. Given I configure "Sumber Pesan" \= "Customer", When a customer message matches, Then tags are added according to the rule scope. 2\. Given "Sumber Pesan" \= "Agent", When an agent message matches, Then tags are added according to the rule scope. 3\. Given "Sumber Pesan" excludes a source, When that excluded source sends a matching message, Then no tags are added. |
| US-005 | P0 | As an Admin or Supervisor, I want a human friendly match type so that word boundary behavior is easy to understand. | 1\. Given "Cara Cocok" \= "Mengandung", When message contains the keyword as a substring, Then it matches. 2\. Given "Cara Cocok" \= "Kata utuh", When the keyword appears as a standalone word separated by space or punctuation, Then it matches. 3\. Given "Cara Cocok" \= "Sama persis", When the whole message equals the keyword after trim, Then it matches. 4\. Given "Cara Cocok" \= "Kata utuh", When keyword appears inside a longer word, Then it does not match. |
| US-006 | P0 | As an Admin or Supervisor, I want to apply auto tags to conversation, ticket, or both so that tagging aligns with visibility needs. | 1\. Given "Cakupan" \= "Percakapan", When a match occurs, Then tags are added to the conversation only. 2\. Given "Cakupan" \= "Tiket", When a match occurs and a ticket exists, Then tags are added to the ticket only. 3\. Given "Cakupan" \= "Percakapan dan Tiket", When a match occurs, Then tags are added to both targets when possible. 4\. Given tags are not compatible with the selected scope, When I try to save, Then I see a validation error explaining compatibility. |
| US-007 | P1 | As an Agent, I want to see that a tag was added automatically so that I understand why a tag appeared. | 1\. Given an auto tag is applied, When I view tags in conversation or ticket, Then I can see the new tag present. 2\. Given an auto tag is applied, When I view activity history (if available), Then I see "Tag ditambahkan otomatis" with the tag name. |
| US-008 | P1 | As an Admin or Supervisor, I want optional targeting by Team Inbox with default All so that rules are simple but controllable. | 1\. Given I create a rule and do not change Team Inbox selection, When saving, Then the rule applies to "Semua Team Inbox". 2\. Given I select specific Team Inbox values, When saving, Then the rule only evaluates messages in those Team Inbox contexts. |
| US-009 | P0 | As the system, I must not reapply tags that already exist so that tagging is idempotent and clean. | 1\. Given a match occurs and the tag already exists on the target, When processing the rule, Then the system does not add duplicate tags. 2\. Given multiple rules add the same tag, When they match on the same message, Then the tag exists only once on the target. |
| US-010 | P0 | As an Admin or Supervisor, I want agent internal notes inclusion to be available only when agent source is selected. | 1\. Given "Sumber Pesan" excludes "Agent", When I view the form, Then I do not see "Konten Agent" options about internal notes. 2\. Given "Sumber Pesan" includes "Agent", When I view the form, Then I can set "Konten Agent" to "Pesan ke pelanggan", "Catatan internal", or "Keduanya". |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Navigation and placement | 1\. FR-001: System MUST add a sub menu "Auto Tagging" under "Settings \> Tags Management". 2\. FR-002: System MUST show a list page for rules and a create flow from that page. |
| Permissions | 1\. FR-003: System MUST allow Admin and Supervisor to create, edit, and delete rules. 2\. FR-004: System MUST allow Agent to view nothing in Settings and deny access with "Akses ditolak". |
| Rule list | 1\. FR-005: System MUST show a rules list with columns: "Nama Rule", "Sumber Pesan", "Cakupan", "Team Inbox", "Tag", "Terakhir diubah". 2\. FR-006: System MUST support search by "Nama Rule". 3\. FR-007: System MUST default sort by "Terakhir diubah" descending. |
| Rule creation and update | 1\. FR-008: System MUST create a rule when all required fields are valid. 2\. FR-009: System MUST update a rule when all required fields are valid. 3\. FR-010: System MUST not include an enable or disable status toggle in v1. |
| Team Inbox targeting | 1\. FR-011: System MUST support "Semua Team Inbox" as default selection. 2\. FR-012: System MUST support optional selection of one or more specific Team Inbox values. |
| Source selection | 1\. FR-013: System MUST provide "Sumber Pesan" options: "Customer", "Agent", "Customer dan Agent". 2\. FR-014: System MUST evaluate rule only on selected sources. |
| Agent content selection | 1\. FR-015: System MUST show "Konten Agent" only if "Sumber Pesan" includes "Agent". 2\. FR-016: System MUST provide "Konten Agent" options: "Pesan ke pelanggan", "Catatan internal", "Keduanya". 3\. FR-017: System MUST evaluate only the selected agent content type. |
| Keywords input | 1\. FR-018: System MUST accept multiple keywords or phrases per rule as a list. 2\. FR-019: System MUST treat a match as true when any single keyword or phrase matches. 3\. FR-020: System MUST ignore empty keyword lines or empty keyword chips on save validation. |
| Match behavior | 1\. FR-021: System MUST provide "Cara Cocok" options: "Mengandung", "Kata utuh", "Sama persis". 2\. FR-022: System MUST be case-insensitive for matching by default. 3\. FR-023: System MUST trim leading and trailing whitespace from message text for "Sama persis". 4\. FR-024: System MUST define "Kata utuh" using word boundary based on non letter and non digit separators. |
| Tag application | 1\. FR-025: System MUST allow selecting one or more existing tags from Tag Management. 2\. FR-026: System MUST dedupe and not add a tag that already exists on the target. 3\. FR-027: System MUST only add tags and never remove tags in v1. |
| Scope type | 1\. FR-028: System MUST provide "Cakupan" options: "Percakapan", "Tiket", "Percakapan dan Tiket". 2\. FR-029: System MUST apply tags to conversation when scope includes "Percakapan". 3\. FR-030: System MUST apply tags to ticket when scope includes "Tiket" and a ticket exists. 4\. FR-031: System MUST not create a ticket just to apply tags. |
| Tag visibility compatibility | 1\. FR-032: System MUST validate selected tags are compatible with chosen scope using the tag visibility field from Tag Management. 2\. FR-033: System MUST allow tags with visibility "Conversation" or "All" when scope is "Percakapan". 3\. FR-034: System MUST allow tags with visibility "Ticket" or "All" when scope is "Tiket". 4\. FR-035: System MUST allow only tags with visibility "All" when scope is "Percakapan dan Tiket". |
| Timing | 1\. FR-036: System MUST evaluate rules on each newly stored message event in a conversation context. 2\. FR-037: System MUST apply tags as soon as evaluation completes for that message. |
| Audit and transparency | 1\. FR-038: System SHOULD record that tags were auto-added using a consistent attribution, for example "Tag ditambahkan otomatis". 2\. FR-039: System MUST store "Terakhir diubah" timestamp for each rule. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI Message (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Block save when "Nama Rule" is empty. | "Nama rule wajib diisi." |
| EH-002 | Validation | Block save when keyword list is empty. | "Minimal 1 kata atau frasa wajib diisi." |
| EH-003 | Validation | Block save when tag list is empty. | "Minimal 1 tag wajib dipilih." |
| EH-004 | Validation | Block save when selected tags are incompatible with chosen scope. | "Tag tidak sesuai dengan cakupan yang dipilih." |
| EH-005 | Permission | Deny access to non Admin and non Supervisor. | "Akses ditolak." |
| EH-006 | Server error | Keep user on form, preserve input, allow retry. | "Gagal menyimpan rule. Coba lagi." |
| EH-007 | Server error | Keep rule row, allow retry. | "Gagal menghapus rule. Coba lagi." |
| EH-008 | Data load | Show empty state with retry. | "Gagal memuat data. Coba lagi." |
| EH-009 | Concurrency | If rule updated by another user, block overwrite and force refresh. | "Rule sudah berubah. Muat ulang halaman." |
| EH-010 | Processing failure | Fail closed for tagging, log internally, do not partially apply. | "Tag otomatis tidak dapat diterapkan." |

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | Notes |
| ----- | ----- | ----- | ----- |
| EC-001 | Keyword is "tolol" and message is "mentololkan". | Does not match when "Cara Cocok" is "Kata utuh". | Word boundary must be respected. |
| EC-002 | Keyword is "parah" and message is "parah.". | Matches for "Kata utuh". | Punctuation counts as a separator. |
| EC-003 | Message has multiple spaces or new lines. | "Mengandung" matches normally. "Sama persis" uses trimmed text only. | Keep normalization minimal. |
| EC-004 | Keyword is a phrase "sangat parah". | Matches only when phrase exists in order. | Phrase treated as literal. |
| EC-005 | Customer sends empty message or attachment only. | No matching evaluation. | Text must exist. |
| EC-006 | Agent source selected, internal note created. | Matches only if "Konten Agent" includes "Catatan internal". | Internal notes are not evaluated otherwise. |
| EC-007 | Multiple rules match the same message and add overlapping tags. | Tags appear once each. | Dedupe per target. |
| EC-008 | Scope includes ticket but ticket does not exist. | Do not apply ticket tags. | No ticket creation. |
| EC-009 | Rule Team Inbox is specific and message is in other Team Inbox. | Rule does not evaluate. | Default is All. |
| EC-010 | Keyword list contains duplicates or whitespace-only lines. | Ignore duplicates and empty entries on save. | Keep UX forgiving. |
| EC-011 | Very long message text. | Still evaluates within performance limits. | See NFR limits. |
| EC-012 | Mixed case message "ToLoL". | Matches due to case-insensitive rule. | Default behavior. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Settings entry | Add menu "Auto Tagging" under "Settings \> Tags Management". | 1\. User opens "Settings". 2\. User opens "Tags Management". 3\. User clicks "Auto Tagging". | US-001 |
| Rules list | Table list with search bar and primary action button "Buat Rule". | 1\. Page loads list sorted by "Terakhir diubah". 2\. User can search by "Cari nama rule". 3\. User clicks "Buat Rule" to open form. | US-001, US-002, US-003 |
| Empty state | Show empty illustration and CTA when no rules exist. | 1\. If list is empty, show text "Belum ada rule auto tagging". 2\. Show CTA button "Buat Rule". | US-001 |
| Create and edit form | Single page form with clear sections and helper text. | 1\. User fills "Nama Rule". 2\. User sets "Team Inbox" default "Semua Team Inbox". 3\. User selects "Sumber Pesan". 4\. If agent included, user selects "Konten Agent". 5\. User inputs keywords in "Kata atau frasa". 6\. User selects "Cara Cocok". 7\. User selects "Cakupan". 8\. User selects "Tag yang ditambahkan". 9\. User clicks "Simpan". | US-001, US-002, US-004, US-005, US-006, US-010 |
| Keywords input UX | Support line based input and show count. | 1\. Field label "Kata atau frasa". 2\. Helper "Satu baris untuk satu kata atau frasa". 3\. Show counter "Jumlah: X". | US-001, US-005 |
| Validation UX | Inline validation with clear messages. | 1\. On "Simpan", highlight invalid fields. 2\. Show inline messages as defined in Error Handling. | US-001 |
| Delete confirmation | Confirmation modal to prevent accidental deletion. | 1\. Click "Hapus". 2\. Show modal title "Hapus rule ini?". 3\. Buttons "Batal" and "Hapus". | US-003 |
| Loading and error states | Show skeleton loading and retry actions. | 1\. On load, show skeleton rows. 2\. On failure, show "Gagal memuat data. Coba lagi" with button "Muat ulang". | US-001 |
| Auto tag transparency | If activity is available, show attribution. | 1\. When tag is auto added, show line "Tag ditambahkan otomatis: {nama\_tag}". | US-007 |

---

## **10\. Field & Validation**

| Field Name (UI label) | Type | Example Value | Validation | Required/Optional | Conditional Visibility |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Nama Rule | Text | High Emotion Case | 1\. Min 3 chars. 2\. Max 50 chars. 3\. Must be unique within the same Team Inbox targeting scope. | Required | Always |
| Team Inbox | Multi select | Semua Team Inbox | 1\. Default to "Semua Team Inbox". 2\. If specific selection used, min 1 item. 3\. Only show Team Inbox user can access. | Optional | Always |
| Sumber Pesan | Single select | Customer dan Agent | Must be one of: Customer, Agent, Customer dan Agent. | Required | Always |
| Konten Agent | Single select | Catatan internal | Must be one of: Pesan ke pelanggan, Catatan internal, Keduanya. | Required when visible | Visible only when "Sumber Pesan" includes Agent |
| Kata atau frasa | Multi line text | tolol | 1\. At least 1 entry after trimming. 2\. Max 50 entries. 3\. Each entry min 1 char max 50 chars. 4\. Duplicate entries are removed or blocked with message. | Required | Always |
| Cara Cocok | Single select | Kata utuh | Must be one of: Mengandung, Kata utuh, Sama persis. | Required | Always |
| Cakupan | Single select | Percakapan dan Tiket | Must be one of: Percakapan, Tiket, Percakapan dan Tiket. | Required | Always |
| Tag yang ditambahkan | Multi select | High Emotion | 1\. At least 1 tag. 2\. Max 10 tags. 3\. Validate tag visibility compatibility with "Cakupan". | Required | Always |

---

## **11\. Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| Performance | 1\. Rules list load p95 \<= 1.0s for up to 200 rules. 2\. Rule evaluation per message p95 \<= 200ms for up to 50 rules and 50 keywords per rule. |
| Reliability | 1\. Tag apply operation is idempotent per tag per target. 2\. On processing failure, do not partially apply tags. |
| Security | 1\. RBAC enforcement for Settings pages. 2\. Prevent unauthorized rule changes and deletes. |
| Privacy | 1\. Evaluate only stored text fields already visible to allowed roles. 2\. No new exposure of message content in Settings beyond rule testing input field. |
| Observability | 1\. Log rule evaluation failures with rule id and target id. 2\. Track count of auto tags added per rule per day. |
| Accessibility | 1\. Full keyboard navigation for list and form. 2\. Clear focus states for inputs and modal actions. |

---

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Depends on existing Tag Management tags and visibility. | Product, Engineering | Incorrect scope behavior if visibility is inconsistent. | Enforce scope compatibility validation at save time. |
| Keyword rules can generate noisy tagging if misconfigured. | Product | Increased false positives. | Provide "Kata utuh" option and clear helper text and examples. |
| Performance degradation on high message throughput. | Engineering | Lag in tag application. | Limit rules and keywords per rule in v1. |
| Permission leakage via Settings access. | Engineering | Unauthorized configuration. | Enforce RBAC and audit changes. |
| Concurrency edits by multiple admins. | Engineering | Lost updates. | Conflict detection and refresh prompt. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Rule creation success rate | \>= 99% | First 30 days after release | Settings telemetry |
| Auto tag apply success rate | \>= 99% | Ongoing | Tag apply logs |
| Manual tagging reduction for selected teams | \>= 30% | First 60 days | Tag events analysis |
| False positive report rate | \<= 5% of tagged conversations | First 60 days | Support tickets and feedback |

---

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Rule enable or disable toggle | Temporary stop without deleting. |
| Regex and advanced matching | More flexible patterns for enterprise use cases. |
| Boolean logic groups | AND conditions, multiple keyword groups per tag. |
| Backfill tagging | Apply rules to historical messages for analytics cleanup. |
| Tag usage analytics per rule | Identify noisy rules and optimize. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No retroactive backfill. | Existing conversations and tickets are not updated automatically. |
| No regex or wildcard. | Some patterns cannot be expressed in v1. |
| No auto tag removal. | Misapplied tags must be removed manually. |
| Limited normalization. | Variants like leetspeak or misspellings are not covered. |
| Ticket tagging requires an existing ticket. | Ticket only scope may not tag if ticket is created later. |

---

## **16\. Appendix**

| Item | Description |
| ----- | ----- |
| Glossary: Team Inbox | A workspace context where conversations are assigned and managed. |
| Glossary: Word boundary for "Kata utuh" | A keyword matches as a whole word when it is preceded and followed by either start or end of text, whitespace, or punctuation. Letters and digits are treated as part of a word. |
| Glossary: Case-insensitive | Matching ignores uppercase and lowercase differences by default. |
| Example rules | 1\. Nama Rule: High Emotion Case. 2\. Sumber Pesan: Customer. 3\. Kata atau frasa: tolol, parah. 4\. Cara Cocok: Kata utuh. 5\. Cakupan: Percakapan dan Tiket. 6\. Tag yang ditambahkan: High Emotion. |

