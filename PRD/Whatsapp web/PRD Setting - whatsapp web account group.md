# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: WhatsApp Web Connect (Account Groups, Reserved Pool, Rename and Clear Account Name) **Product Manager**: Aryo  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v2.0 | 2025-10-09 | Yusril Ibnu Maulana | MVP scope for Account List, Account Groups, Reserved Accounts, metrics, search/filter/sort, pagination, bulk actions, swap replacement, manual active switch, quota reminder. |
| v2.1 | 2026-02-03 | Yusril Ibnu Maulana | End to end revision. Add Rename Account Name and Clear Account Name. Clarify naming model and UI copy localization. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide fast, reliable fleet management for many WhatsApp Web numbers with grouping, reserved pool replacement, quota visibility, and safe admin actions including rename and clear account name. |
| Scope | Covers list, group management actions, reserved pool actions, rename and clear account name, and auditability. |

| In Scope | Out of Scope |
| ----- | ----- |
| Metrics cards for fleet health. | Auto rotation based on cap or time. |
| Tabs for Account Groups and Reserved Accounts. | Advanced analytics and export. |
| Search, filter, sort, pagination or virtualization. | Non admin role mutations. |
| Group actions: switch active number, move, replace from reserved, link team inbox. | Broadcast controls and per number simulation settings. |
| Reserved actions: assign to group, delete. | Workflow builder. |
| Rename Account Name and Clear Account Name. | Bulk rename and bulk clear name. |
| Audit log for all mutations. | Multi channel account management. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Fleet visibility across many numbers is slow and fragmented. | Delayed reactions, missed outages, lower agent productivity. |
| PS-002 | Replacement from backup pool is not fast and safe enough during peak load. | Downtime and misrouting during operational spikes. |
| PS-003 | Account naming is not flexible enough for day to day ops. | Slower identification, higher operator error, inconsistent naming hygiene. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Make fleet health obvious in one glance. | Initial list render p95 \<= 1 second for 500 rows. |
| Reduce time to replace numbers. | Replace from reserved completed in \<= 3 clicks, median \<= 30 seconds. |
| Prevent silent quota overuse. | 100 percent of numbers over cap show warning within 30 seconds of refresh. |
| Improve ops clarity via naming controls. | Rename and clear name available from row actions with \>= 95 percent success rate. |

## **5\. User Stories and Acceptance Criteria**

### **5.1 Account Groups**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to view Account Groups with clear states so I can manage routing and health quickly. | 1\. Given I open tab "Grup Akun", When the page loads, Then I see group cards with group name, counter "Terhubung: x/y", and "Team Inbox: {nama atau Tidak ada}". 2\. Given a group is expanded, When I view the numbers table, Then each row shows "Nomor WhatsApp", "Nama Akun", "Status Koneksi", "Status Penggunaan", and "Total Kirim Hari Ini". 3\. Given data fetch fails, When the page retries, Then I see "Gagal memuat data. Coba lagi" and a retry action. |
| US-002 | P0 | As an Admin, I want to switch the active number inside a group so I can keep operations running. | 1\. Given a group has at least 2 numbers with status "Terhubung", When I set another number as active and confirm, Then the selected becomes "Digunakan" and the previous becomes "Siaga". 2\. Given the target number is not "Terhubung", When I attempt to set active, Then the action is blocked and I see "Nomor harus Terhubung untuk digunakan". 3\. Given the group has only 1 number, When I attempt to switch active, Then I see "Tidak ada nomor lain untuk dipilih". |
| US-003 | P0 | As an Admin, I want to see quota warnings so I can prevent daily cap breaches. | 1\. Given a number has sent\_today \> recommended\_cap, When the list refreshes, Then the "Total Kirim Hari Ini" cell is highlighted and shows badge "Melebihi batas". 2\. Given the warning is shown, When I open tooltip or detail, Then I see "Pertimbangkan ganti nomor aktif atau ganti dari cadangan". 3\. Given cap data is unavailable, When the list renders, Then cap shows "-" and no warning badge is shown and I see banner "Data batas sementara tidak tersedia". |
| US-004 | P0 | As an Admin, I want to replace a group number from reserved pool so I can recover quickly. | 1\. Given I choose action "Ganti dari Cadangan" on a group row, When the picker opens, Then only reserved numbers with status "Terhubung" are selectable and others are disabled with explanation. 2\. Given I confirm replacement, When the operation succeeds, Then the selected reserved number joins the group as "Siaga" by default and the swapped out number moves to reserved pool. 3\. Given I enable option "Jadikan aktif sekarang", When replacement completes, Then the new number becomes "Digunakan" and previous active becomes "Siaga". |
| US-005 | P0 | As an Admin, I want to move a number to another group so I can rebalance capacity. | 1\. Given I click action "Pindahkan Grup" on a number, When I select destination group and confirm, Then the number appears in destination group with status usage set to "Siaga". 2\. Given the number is currently "Digunakan", When I attempt to move, Then I must confirm and the system must keep each group having exactly one active number after the move. 3\. Given the move would cause a group to have zero active numbers, When I confirm, Then the action is blocked and I see "Grup harus memiliki 1 nomor aktif". |
| US-006 | P1 | As an Admin, I want to link a group to a Team Inbox optionally so routing is controlled but flexible. | 1\. Given I open group settings, When I select a team inbox and save, Then the group shows "Team Inbox: {nama}". 2\. Given I clear the selection, When I save, Then the group shows "Team Inbox: Tidak ada" and routing defaults to main inbox. 3\. Given I lack permission, When I attempt to update, Then I see "Akses ditolak". |

### **5.2 Reserved Accounts**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-007 | P0 | As an Admin, I want to view all reserved accounts so I know what replacements are available. | 1\. Given I open tab "Akun Cadangan", When the page loads, Then I see a table with "Nomor WhatsApp", "Nama Akun", "Status Koneksi", and "Terakhir Diperbarui". 2\. Given a reserved number is not eligible for replacement, When it appears in pickers, Then it is disabled with explanation based on status. 3\. Given there are no reserved accounts, When the list loads, Then I see empty state "Belum ada akun cadangan" with CTA "Tambah Akun". |
| US-008 | P0 | As an Admin, I want to assign multiple reserved numbers to a group so I can scale capacity quickly. | 1\. Given I select multiple reserved numbers with status "Terhubung", When I click "Tetapkan ke Grup", Then I can select destination group and review summary before confirm. 2\. Given I choose mode "Tukar", When I confirm, Then I must pick equal count of group numbers to move to reserved pool and the operation completes as one atomic change. 3\. Given I choose mode "Tambah saja", When I confirm, Then selected reserved numbers join the group and no group numbers are swapped out. |
| US-009 | P0 | As an Admin, I want to delete reserved numbers so I can clean up unused accounts. | 1\. Given I select reserved numbers, When I click "Hapus Akun" and confirm, Then the accounts are removed from the platform and sessions are cleared. 2\. Given some selected items are blocked by policy, When I confirm, Then I see result summary "Berhasil: x. Gagal: y" and reasons per item. 3\. Given deletion fails, When the system retries, Then no partial UI state is shown as completed and I see "Gagal menghapus akun. Coba lagi". |

### **5.3 Global List Interactions**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-010 | P0 | As an Admin, I want to search, filter, and sort quickly so I can find accounts fast. | 1\. Given I type into search, When I search by group name, account name, WhatsApp profile name, or number, Then results update within 1 second p95 for 500 rows. 2\. Given I set filters, When I filter by "Status Koneksi", "Tanggal Dibuat", and "Tautan Team Inbox", Then only matching rows render. 3\. Given I sort by columns, When I choose a sort, Then the list order changes and stays consistent across pagination. |
| US-011 | P0 | As an Admin, I want bulk actions to be safe so I avoid destructive mistakes. | 1\. Given I select rows across pages, When I navigate pagination, Then selections persist and I can see selection count. 2\. Given I click "Pilih semua hasil", When I confirm, Then selection applies server side to the current filter set and I see count preview before confirm. 3\. Given an unsafe action, When I confirm, Then I see modal summary of impact and must confirm again to proceed. |
| US-012 | P0 | As an Admin, I want to rename account names so I can maintain consistent labeling. | 1\. Given any account row, When I click row action "Ubah Nama", Then a modal opens with input prefilled and actions "Simpan" and "Batal". 2\. Given I enter a valid name, When I click "Simpan", Then the list updates and I see "Nama berhasil diperbarui". 3\. Given the name length is invalid, When I attempt to save, Then I see "Nama harus 1 sampai 50 karakter" and save is blocked. |
| US-013 | P1 | As an Admin, I want to clear account name so I can remove outdated custom labels. | 1\. Given any account row with custom name, When I click row action "Hapus Nama Kustom", Then a confirm modal explains fallback behavior and requires confirmation. 2\. Given I confirm, When the operation succeeds, Then custom name becomes empty and the UI falls back to WhatsApp profile name, else phone number. 3\. Given the operation fails, When I retry, Then no partial changes are committed and I see "Gagal menghapus nama. Coba lagi". |
| US-014 | P0 | As an Admin, I want to delete an account safely so I can remove unusable numbers. | 1\. Given I click row action "Hapus Akun", When confirm modal opens, Then it explains sessions will be disconnected and data impact summary is shown. 2\. Given the account is active in a group, When I attempt delete, Then the action is blocked and I see "Tidak bisa menghapus nomor aktif. Ganti nomor aktif dulu". 3\. Given I confirm deletion on an eligible account, When the operation succeeds, Then the account disappears from the list and audit log records the change. |
| US-015 | P0 | As an Admin, I can delete an Account Group so I can remove unused grouping structures. | Given group header menu, When I click “Hapus Grup”, Then system shows confirm modal with impact summary (group name, linked team inbox status, count of numbers inside). If group has 0 numbers, delete proceeds immediately. If group has \>= 1 number, action is blocked by default OR requires a rehoming option: Option A (recommended): Move all numbers to Reserved pool, then delete group. Option B: Move all numbers to another group, then delete group. If group is linked to Team Inbox, link is removed automatically upon deletion (with audit record). |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Tabs and Access | FR-001: System MUST provide two tabs named "Grup Akun" and "Akun Cadangan". FR-002: System MUST restrict all mutation actions to Admin role. FR-003: System MUST allow read only access to metrics and list to authorized roles if configured, but MVP assumes Admin only. |
| Data Model and Invariants | FR-004: System MUST enforce unique group name per tenant with length 1 to 100\. FR-005: System MUST enforce each number belongs to exactly one group or reserved pool at any time. FR-006: System MUST enforce exactly one "Digunakan" number per group at all times. FR-007: System MUST persist connection status values as "Terhubung", "Tidak Terhubung", "Terbatas". |
| List Rendering and Performance | FR-008: System MUST support pagination or virtualization for 1000+ numbers without UI stall. FR-009: System MUST support search, filter, sort on both tabs with p95 \<= 1 second for 500 rows. FR-010: System MUST keep selection state across pagination and support server side "Pilih semua hasil". |
| Active Switch | FR-011: System MUST allow setting a different number as "Digunakan" only if its connection status is "Terhubung". FR-012: System MUST block switching to non connected numbers and return a human readable reason. |
| Quota and Cap | FR-013: System MUST display "Total Kirim Hari Ini" as sent\_today and recommended\_cap. FR-014: System MUST show badge "Melebihi batas" when sent\_today \> recommended\_cap. FR-015: System MUST show recommended\_cap as "-" when cap service is unavailable and suppress warnings. |
| Replace from Reserved | FR-016: System MUST allow replacing one group number using one reserved number as a single atomic operation. FR-017: System MUST only allow reserved candidates with status "Terhubung" to be selected for replacement. FR-018: System MUST support option to set the new number as "Digunakan" immediately after replacement. |
| Move Between Groups | FR-019: System MUST allow moving a number to another group and reset usage status to "Siaga" in destination group. FR-020: System MUST block moves that violate the invariant of exactly one active number per group, unless a safe resolution is selected within the same flow. |
| Link Team Inbox | FR-021: System MUST allow linking a group to a Team Inbox as an optional setting. FR-022: System MUST default routing to main inbox when group is not linked. |
| Bulk Assign and Delete | FR-023: System MUST support bulk assign reserved numbers to a group in two modes named "Tukar" and "Tambah saja". FR-024: System MUST block bulk actions for ineligible items and provide per item reasons. FR-025: System MUST allow deleting accounts from reserved pool and from groups only if the number is not "Digunakan". |
| Rename and Clear Account Name | FR-026: System MUST support rename of account custom name from row action "Ubah Nama" on both tabs. FR-027: System MUST validate account name length 1 to 50 and reject invalid inputs. FR-028: System MUST support clearing custom account name from row action "Hapus Nama Kustom". FR-029: System MUST render fallback display name in this order: custom account name, WhatsApp profile name, phone number. |
| Audit and Idempotency | FR-030: System MUST audit all mutations including switch, replace, move, link, assign, delete, rename, and clear name with who, when, before, after, and reason. FR-031: System MUST make swap, move, rename, clear name, and delete idempotent based on a client mutation id to prevent double apply on retries. |

## **7\. Error Handling**

| ID | Type | Scenario | Handling | UI Copy (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- | ----- |
| EH-001 | Validation | Switch active to non connected number. | Block action. Keep current state. | "Nomor harus Terhubung untuk digunakan". |
| EH-002 | Validation | Replace candidate is not connected. | Disable candidate in picker with explanation. | "Hanya akun Terhubung yang bisa dipakai". |
| EH-003 | Transaction | Swap fails mid operation. | Roll back. No state changes applied. Log correlation id. | "Penggantian gagal. Tidak ada perubahan". |
| EH-004 | Partial Bulk | Bulk assign includes ineligible items. | Skip ineligible. Show summary with counts and reasons. | "Sebagian akun dilewati karena tidak Terhubung". |
| EH-005 | Policy | Delete blocked because number is active. | Block delete. Provide next step guidance. | "Tidak bisa menghapus nomor aktif. Ganti nomor aktif dulu". |
| EH-006 | Dependency | Cap service unavailable. | Show cap "-" and suppress warning. Show banner. | "Data batas sementara tidak tersedia". |
| EH-007 | Network | List fetch failure. | Keep skeleton. Allow retry. | "Gagal memuat data. Coba lagi". |
| EH-008 | Validation | Rename invalid length or empty. | Block save. Highlight field. | "Nama harus 1 sampai 50 karakter". |
| EH-009 | Concurrency | Rename or clear name conflict due to concurrent update. | Reject write. Fetch latest. Ask user to retry. | "Data berubah. Muat ulang dan coba lagi". |
| EH-010 | Network | Rename or clear name failure. | No UI optimistic commit. Allow retry. | "Gagal memperbarui nama. Coba lagi". |

## **8\. Edge Cases**

| ID | Case | Handling |
| ----- | ----- | ----- |
| EC-001 | Group has only one number. | It must be "Digunakan" if connected. Switching requires adding another connected number first. |
| EC-002 | All numbers in a group exceed cap. | Group header shows warning badge "Semua nomor melebihi batas". |
| EC-003 | Reserved pool empty. | Disable replacement flows. Show CTA to add reserved numbers. |
| EC-004 | Moving an active number. | Require confirmation. Enforce invariant of one active per group. |
| EC-005 | Restricted numbers visible everywhere. | Cannot be set as active. Cannot be used for replacement. Can be deleted. |
| EC-006 | Select all results on large tenant. | Must be server side selection bound to current filters. Show count preview. |
| EC-007 | Clear name on an account without WhatsApp profile name. | Fallback must be phone number. |
| EC-008 | Rename to same value. | Treat as no op. Return success without audit duplication, or mark as unchanged based on system policy. |
| EC-009 | Delete an account that still appears in selection set after refresh. | Action must revalidate eligibility at time of mutation and fail with reason if no longer eligible. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Metrics Cards | Cards show Total Akun, Terhubung, Tidak Terhubung, Total Kirim Hari Ini. | 1\. Load page. 2\. Render cards before table when possible. 3\. On error show "Gagal memuat ringkasan". | US-001 |
| Tabs | Tabs named "Grup Akun" and "Akun Cadangan". | 1\. Default open "Grup Akun". 2\. Persist last selected tab per user. | US-001, US-007 |
| Search Bar | Search placeholder "Cari grup, nama, atau nomor". | 1\. Type keyword. 2\. Debounce input. 3\. Show loading indicator "Mencari". | US-010 |
| Filters | Filters: "Status Koneksi", "Tanggal Dibuat", "Tautan Team Inbox". | 1\. Open filter popover. 2\. Select values. 3\. Apply shows chip labels in Indonesian. | US-010 |
| Group Header | Shows group name, "Terhubung: x/y", "Team Inbox: {nama atau Tidak ada}", actions menu. | 1\. Expand group. 2\. Open menu for group settings. 3\. Save changes shows toast "Berhasil disimpan". | US-001, US-006 |
| Numbers Table | Columns: "Nomor WhatsApp", "Nama Akun", "Status Koneksi", "Status Penggunaan", "Total Kirim Hari Ini". | 1\. Render rows with kebab menu per row. 2\. Loading skeleton per group section. 3\. Empty group state "Belum ada akun di grup ini". | US-001 |
| Quota Warning | Inline badge "Melebihi batas" on cell and optional tooltip text. | 1\. Hover or tap badge. 2\. Show guidance "Pertimbangkan ganti nomor aktif atau ganti dari cadangan". | US-003 |
| Replace Dialog | Modal title "Ganti dari Cadangan". Option checkbox "Jadikan aktif sekarang". | 1\. Open dialog from row action. 2\. Pick eligible reserved candidate. 3\. Confirm "Ganti". On success toast "Berhasil mengganti nomor". | US-004 |
| Move Dialog | Modal title "Pindahkan ke Grup". Shows note about usage reset. | 1\. Open dialog from row action. 2\. Select destination group. 3\. Confirm "Pindahkan". | US-005 |
| Bulk Toolbar | Toolbar shows selection count and actions based on tab. | 1\. Select checkboxes. 2\. Show "x dipilih". 3\. Provide "Pilih semua hasil" option. | US-011, US-008, US-009 |
| Bulk Assign Flow | 3 step flow with review summary. | 1\. Step 1 pilih grup tujuan. 2\. Step 2 pilih mode "Tukar" atau "Tambah saja". 3\. Step 3 tinjau dan konfirmasi "Tetapkan". | US-008 |
| Rename Modal | Modal title "Ubah Nama Akun". Input label "Nama Akun". | 1\. Open from row action "Ubah Nama". 2\. Validate on input and on save. 3\. Save shows toast "Nama berhasil diperbarui". | US-012 |
| Clear Name Confirm | Confirm modal title "Hapus Nama Kustom". Shows fallback explanation. | 1\. Open from row action "Hapus Nama Kustom". 2\. Confirm "Hapus". 3\. Success toast "Nama kustom dihapus". | US-013 |
| Delete Confirm | Confirm modal title "Hapus Akun". Shows impact summary. | 1\. Open from row action "Hapus Akun". 2\. Confirm "Hapus". 3\. Success toast "Akun berhasil dihapus". | US-014 |
| Empty, Loading, Error | Standard states across both tabs. | Loading "Memuat". Empty "Tidak ada data". Error "Gagal memuat data. Coba lagi". | US-001, US-007, US-010 |

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| group\_id | String | "grp\_123" | System generated. Unique per tenant. | Yes |
| group\_name | String | "CS Jakarta" | 1 to 100 chars. Unique per tenant. | Yes |
| linked\_team\_inbox\_id | String or Null | "inbox\_123" | Must reference existing Team Inbox in tenant. | No |
| phone\_e164 | String | "+6281234567891" | E.164 format. Unique per tenant. | Yes |
| account\_name\_custom | String or Null | "Alex CS 01" | If set: 1 to 50 chars. | No |
| whatsapp\_profile\_name | String or Null | "Alex" | Read only from WhatsApp session if available. | No |
| display\_name\_rendered | Derived String | "Alex CS 01" | Render order: custom, WhatsApp profile name, phone number. | Yes |
| connection\_status | Enum | "Terhubung" | Allowed: Terhubung, Tidak Terhubung, Terbatas. | Yes |
| usage\_status | Enum | "Digunakan" | Allowed: Digunakan, Siaga. Exactly one Digunakan per group. | Yes |
| sent\_today | Integer | 1029 | \>= 0\. | Yes |
| recommended\_cap\_today | Integer or Null | 200 | If available: \>= 0\. If unavailable: Null. | No |
| created\_at | Timestamp | "2026-02-03T10:00:00+07:00" | System set. | Yes |
| last\_updated\_at | Timestamp | "2026-02-03T10:05:00+07:00" | System set. | Yes |
| is\_reserved | Boolean | true | True for reserved pool. False for group membership. | Yes |

## **11\. Non-Functional Requirements**

| Attribute | Target |
| ----- | ----- |
| Performance | Initial render p95 \<= 1 second for 500 rows. Search filter sort p95 \<= 1 second for 500 rows. |
| Scalability | Support 1000+ numbers per tenant via pagination or virtualization. |
| Reliability | Swap and move are atomic. No partial state visible on failure. |
| Security | Admin only mutations. Audit log immutable. |
| Observability | Metrics for list latency, swap success rate, rename success rate, delete success rate, bulk outcomes. |
| Accessibility | Keyboard navigable table actions. Visible focus state. Color is not the only indicator for warnings. |

## **12\. Dependencies & Risks**

| Type | Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- | ----- |
| Internal | Cap provider for recommended daily limits. | Platform | Missing warnings and cap display. | Show cap "-" and banner. Recover when service returns. |
| Internal | Team Inbox linking and routing. | Platform | Misrouting if misconfigured. | Default to main inbox. Show explicit link status. |
| External | WhatsApp Web session stability. | Engineering | Frequent disconnect affects status. | Poll and push updates. Debounce status flips. |
| Product | Naming ambiguity between account name and WhatsApp profile name. | PM and Design | Operator confusion. | UI explicitly labels "Nama Akun" and shows fallback rule in confirm modals. |
| Data | Concurrency updates on rename and clear. | Engineering | Overwrite or stale UI. | Use optimistic concurrency control and show retry message. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Time to replace from reserved | Median \<= 30 seconds | 30 days after release | Product analytics events |
| Swap success rate | \>= 95 percent | 30 days after release | Audit log outcomes |
| Over cap acknowledgment | \>= 90 percent within 1 hour | 30 days after release | UI events and audit |
| Rename success rate | \>= 95 percent | 30 days after release | Audit log outcomes |
| List interaction latency | p95 \<= 1 second | Ongoing | Frontend performance metrics |

## **14\. Future Considerations**

| Topic | Why it matters |
| ----- | ----- |
| Auto rotation based on cap and eligibility | Reduce manual ops and prevent quota breaches. |
| Bulk move between groups | Faster rebalancing for large tenants. |
| Bulk set active | Reduce clicks during incident response. |
| Export audit logs | Compliance and investigation workflows. |
| Policy based swap candidate suggestion | Reduce operator error under pressure. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Manual rotation only | Requires human action after quota warning. |
| No bulk rename or bulk clear name | Slower cleanup for large fleets. |
| Restricted numbers visible but ineligible | Some picker clutter despite disabling. |
| Very large tenants require server side selection | "Pilih semua hasil" depends on backend support. |

## **16\. Appendix**

### **16.1 Status and Action Matrix**

| Location | Condition | Allowed Actions |
| ----- | ----- | ----- |
| Group table | Terhubung and Digunakan | Set active blocked, Replace, Move, Rename, Clear name, Delete blocked. |
| Group table | Terhubung and Siaga | Set active, Replace, Move, Rename, Clear name, Delete allowed. |
| Group table | Tidak Terhubung or Terbatas | Replace, Move, Rename, Clear name, Delete allowed. Set active blocked. |
| Reserved table | Terhubung | Assign to group, Rename, Clear name, Delete allowed. |
| Reserved table | Tidak Terhubung or Terbatas | Assign blocked. Rename, Clear name, Delete allowed. |

### **16.2 Bulk Actions Matrix**

| Action | Tab | MVP | Notes |
| ----- | ----- | ----- | ----- |
| Tetapkan ke Grup | Akun Cadangan | Yes | Modes: Tukar or Tambah saja. |
| Hapus Akun | Akun Cadangan | Yes | Requires confirm modal. |
| Hapus Akun | Grup Akun | Yes | Block when Digunakan. |
| Ubah Nama | Both | No | Must be single row action only. |
| Hapus Nama Kustom | Both | No | Must be single row action only. |

### **16.3 Glossary**

| Term | Definition |
| ----- | ----- |
| Grup Akun | Grouping container for WhatsApp numbers used for rotation. |
| Akun Cadangan | Reserved pool of numbers available for replacement. |
| Digunakan | Usage status meaning the number is currently active in the group. |
| Siaga | Usage status meaning the number is in group but not active. |
| Nama Akun | Custom admin editable label stored in platform. |
| Nama WhatsApp | Profile name obtained from WhatsApp if available. |

