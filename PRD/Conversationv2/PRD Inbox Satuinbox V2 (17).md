# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Team Inbox Member Drawer and Online Status HUD  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead: Sabrina**

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-23 | Yusril Ibnu Maulana | Add remove member, last seen relative format, and auto-unassign on removal. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide fast team capacity visibility and membership management inside Inbox by showing members and online counts, listing members with presence and last seen, and enabling add and remove of existing users for a Team Inbox. |
| Scope | Applies to Team Inbox context in Inbox screen only. |

| In Scope | Out of Scope |
| ----- | ----- |
| Header HUD showing total members and online count. | Inviting new users via email. |
| Member Drawer with supervisors section, filters, search, presence labels, and last seen relative timestamp. | Editing roles and permissions. |
| Add existing users to Team Inbox from drawer. | Creating new users. |
| Remove existing users from Team Inbox from drawer. | Auto-away threshold configuration UI. |
| Real-time updates for presence and membership changes. | Workload routing and staffing recommendations. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| P-001 | Team capacity is not visible in Inbox. | Slower operational decisions for staffing and response. |
| P-002 | Adding and removing Team Inbox members requires leaving Inbox context. | Higher operational friction and slower changes. |
| P-003 | Supervisor identity and member availability are not immediately clear. | Slower escalation and coordination. |

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Improve team visibility in Inbox | 80% of weekly active supervisors open the Member Drawer at least once per week within 30 days. |
| Reduce membership management friction | Median time to add or remove an existing user from a Team Inbox is under 45 seconds within 30 days. |
| Increase availability clarity | 95% of member rows display a valid presence state and a last seen value or fallback within 30 days. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a user, I want to see total members and online count in the Team Inbox header so that I can understand current team capacity. | 1\. Given a Team Inbox is selected, When the Inbox header renders, Then it shows `Anggota {n} • Online {m}`. 2\. Given online includes Active and Away, When a member transitions from Active to Away, Then Online count remains the same. 3\. Given presence is unavailable, When the header renders, Then Online shows `Online -` and Inbox remains usable. |
| US-002 | P0 | As a user, I want to open a Member Drawer so that I can see who is Active, Away, and Offline. | 1\. Given the HUD is visible, When I click the HUD, Then the Member Drawer opens. 2\. Given the drawer is open, When presence updates occur, Then the list and counts update without page reload. 3\. Given I do not have access to the Team Inbox, When I attempt to open the drawer, Then I see `Akses ditolak` and the drawer does not open. |
| US-003 | P0 | As a user, I want to see supervisors clearly so that I can escalate quickly. | 1\. Given the Team Inbox has supervisors, When the drawer opens, Then a `Supervisor` section appears at the top and lists supervisors first. 2\. Given the Team Inbox has no supervisors, When the drawer opens, Then the section shows `Belum ada supervisor`. |
| US-004 | P0 | As a user, I want to search and filter members so that I can find people quickly. | 1\. Given the drawer is open, When I type a query, Then the list filters by name or email. 2\. Given the Online filter is selected, When the list renders, Then it shows only Active and Away members. 3\. Given the Offline filter is selected, When the list renders, Then it shows only Offline members. 4\. Given no results match, When the list renders, Then it shows `Tidak ada hasil` and keeps the search term. |
| US-005 | P0 | As an authorized user, I want to add existing users to the Team Inbox so that I can adjust staffing quickly. | 1\. Given I have permission, When I click `Tambah anggota`, Then I can search and multi-select existing users and confirm. 2\. Given a selected user is already a member, When the user appears in the picker, Then the row is disabled and shows `Anggota sudah terdaftar`. 3\. Given I do not have permission, When I open the drawer, Then `Tambah anggota` is hidden or disabled. 4\. Given the add request succeeds, When I return to the drawer, Then the new members appear and HUD counts update. |
| US-006 | P0 | As an authorized user, I want to remove members from the Team Inbox so that I can keep membership accurate. | 1\. Given I have permission, When I choose `Hapus dari tim` on a member, Then a confirmation modal appears. 2\. Given the modal is shown, When I confirm removal, Then the member is removed and counts update. 3\. Given the member is the last supervisor and the policy is enabled, When I confirm removal, Then the system blocks removal and shows `Minimal 1 supervisor harus tetap ada`. 4\. Given the removed member is assigned to conversations in this Team Inbox, When removal completes, Then those conversations become unassigned and the action is logged. |
| US-007 | P0 | As a user, I want last seen shown in a relative format so that I can judge recency quickly. | 1\. Given a member is Away or Offline and last seen exists, When the row renders, Then last seen shows relative time such as `5 menit lalu`. 2\. Given a member is Active, When the row renders, Then last seen shows `Aktif sekarang`. 3\. Given last seen is unavailable, When the row renders, Then it shows `-` and does not block actions. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Header HUD | FR-001: System MUST display a clickable HUD in the Team Inbox header showing total members and online count. FR-002: System MUST calculate online count as Active plus Away members only. FR-003: System MUST update HUD counts when membership or presence changes occur. FR-004: System MUST show fallback `Online -` when presence is unavailable and MUST not block Inbox usage. |
| Member Drawer | FR-005: System MUST open the Member Drawer when user clicks the HUD. FR-006: System MUST display only members assigned to the selected Team Inbox. FR-007: System MUST render a Supervisors section at the top with label `Supervisor`. FR-008: System MUST show per-member row fields: avatar, display name, email if available, role badge, presence label, last seen value. FR-009: System MUST provide filters: `Semua`, `Online`, `Offline`. FR-010: System MUST define Online filter as Active plus Away. FR-011: System MUST define Offline filter as Offline only. FR-012: System MUST provide search by name and email with 300 ms debounce. FR-013: System MUST update visible list and counts when presence changes while drawer is open. |
| Sorting | FR-014: System MUST list supervisors first in a dedicated section. FR-015: System MUST order members by presence group: Active, Away, Offline, Unknown. FR-016: System MUST order members within a group alphabetically by display name. |
| Presence Labels | FR-017: System MUST support presence states: Active, Away, Offline, Unknown. FR-018: System MUST display labels in Bahasa Indonesia: `Online`, `Away`, `Offline`, `Tidak diketahui`. FR-019: System MUST treat Unknown as not counted in Online count. |
| Last Seen | FR-020: System MUST display last seen in relative format for Away and Offline when last seen exists. FR-021: System MUST display `Aktif sekarang` for Active members. FR-022: System MUST display `-` when last seen is not available. FR-023: System MUST refresh last seen values when presence updates are received or on drawer refresh interval. |
| Add Member (existing users only) | FR-024: System MUST show `Tambah anggota` action only to users with permission to manage Team Inbox membership. FR-025: System MUST open an Add Member modal allowing selection of existing users only. FR-026: System MUST allow multi-select up to 50 users per submission. FR-027: System MUST prevent duplicates and show `Anggota sudah terdaftar` for existing members in the picker. FR-028: System MUST update the drawer list and HUD counts immediately after success. FR-029: System MUST write an audit log entry for each add operation including actor, Team Inbox, target users, and timestamp. |
| Remove Member | FR-030: System MUST expose `Hapus dari tim` action per member row only to users with permission to manage Team Inbox membership. FR-031: System MUST require confirmation before removal. FR-032: System MUST support idempotent removal and treat repeated requests as success without duplicating side effects. FR-033: System MUST update the drawer list and HUD counts immediately after success. FR-034: System MUST write an audit log entry for each removal including actor, Team Inbox, target user, and timestamp. FR-035: System MUST block removing the last supervisor when the policy is enabled and MUST show `Minimal 1 supervisor harus tetap ada`. FR-036: System MUST auto-unassign conversations in the Team Inbox where the removed user is the assignee and MUST set assignee to null. FR-037: System MUST log the auto-unassign side effect in audit logs with count of impacted conversations. |
| Authorization | FR-038: System MUST enforce Team Inbox access control server-side for drawer data. FR-039: System MUST enforce manage membership permission server-side for add and remove operations. FR-040: System MUST not reveal members of other Team Inboxes in any drawer or picker results unless explicitly adding and the user is authorized to search existing users tenant-wide. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Authorization | Block drawer open when user lacks Team Inbox access. | Show `Akses ditolak` and keep user on Inbox. |
| EH-002 | Presence unavailable | Fail open for membership list and mark presence Unknown. | HUD shows `Online -`. Member rows show `Tidak diketahui`. |
| EH-003 | Add member validation | Reject submission when selection is empty or exceeds limit. | Disable confirm button. Show inline message `Pilih minimal 1 anggota`. |
| EH-004 | Add member conflict | Treat already-member as non-addable. | Disable row with `Anggota sudah terdaftar`. |
| EH-005 | Add member request failure | Do not partially update UI. Allow retry. | Show toast `Gagal menambahkan anggota`. Action `Coba lagi`. |
| EH-006 | Remove blocked by policy | Block removing last supervisor. | Show `Minimal 1 supervisor harus tetap ada`. |
| EH-007 | Remove request failure | Keep member visible. Allow retry. | Show toast `Gagal menghapus anggota`. Action `Coba lagi`. |
| EH-008 | Auto-unassign failure after removal | Removal succeeds. Auto-unassign retries. Show warning state. | Show toast `Perubahan assignee sedang diproses`. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Team Inbox has 0 members | HUD shows `Anggota 0 • Online 0`. Drawer shows empty state. | Show `Belum ada anggota`. |
| EC-002 | Team Inbox has no supervisors | Supervisors section renders empty. | Show `Belum ada supervisor`. |
| EC-003 | Large team over 200 members | Use incremental loading and server-side search. | Show list loading rows on scroll. |
| EC-004 | Presence flapping | Stabilize updates to reduce flicker. | Update per user at most once every 2 seconds. |
| EC-005 | User switches Team Inbox while drawer open | Drawer switches context to the new Team Inbox. | Keep search term. Reset filters to `Semua`. |
| EC-006 | Member removed while drawer open by another admin | Drawer refresh removes the row. | Show toast `Daftar anggota diperbarui`. |
| EC-007 | Add member while presence unavailable | Member is added with presence Unknown and last seen `-`. | List remains usable. |
| EC-008 | Remove member who is assignee of many conversations | Removal triggers auto-unassign. | Show toast `Assignee diperbarui`. |
| EC-009 | Time skew for last seen | Clamp negative durations to `Baru saja`. | Show `Baru saja`. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Header HUD | Clickable label in Team Inbox header showing `Anggota {n} • Online {m}`. | 1\. User selects a Team Inbox. 2\. HUD renders counts. 3\. User clicks HUD to open drawer. | US-001, US-002 |
| Member Drawer | Right-side drawer listing members and supervisors with presence and last seen. | 1\. Drawer opens with loading state. 2\. Drawer shows summary and controls. 3\. List renders supervisors section. 4\. List renders members with presence and last seen. | US-002, US-003, US-007 |
| Filters | Tabs for `Semua`, `Online`, `Offline`. | 1\. Default is `Semua`. 2\. Switching tab updates list immediately. 3\. Search term persists across tabs. | US-004 |
| Search | Search input in drawer for name or email. | 1\. User types query. 2\. System updates results after 300 ms debounce. 3\. Empty results show `Tidak ada hasil`. | US-004 |
| Supervisors Section | Top section listing supervisors with a badge `Supervisor`. | 1\. If supervisors exist, show list. 2\. If none, show `Belum ada supervisor`. | US-003 |
| Member Row | Displays identity, role badge, presence label, and last seen. | 1\. Active shows `Online` and last seen `Aktif sekarang`. 2\. Away shows `Away` and relative last seen. 3\. Offline shows `Offline` and relative last seen. 4\. Unknown shows `Tidak diketahui` and `-`. | US-002, US-007 |
| Add Member Modal | Modal to add existing users to Team Inbox. | 1\. User clicks `Tambah anggota`. 2\. Modal opens with search and list of existing users. 3\. User selects users and confirms. 4\. Drawer updates list and counts. | US-005 |
| Remove Member Action | Per member row menu `Hapus dari tim` with confirmation modal. | 1\. User clicks `Hapus dari tim`. 2\. Confirmation modal opens. 3\. User confirms. 4\. Member removed and counts update. | US-006 |
| Empty States | Empty state for no members, no supervisors, and no search results. | 1\. No members shows `Belum ada anggota`. 2\. No supervisors shows `Belum ada supervisor`. 3\. No results shows `Tidak ada hasil`. | US-003, US-004 |
| Loading States | Loading skeletons for member list and modal user picker. | 1\. Drawer shows skeletons until membership loads. 2\. Presence and last seen fill progressively. | US-002 |

### **UI Copy (Bahasa Indonesia only)**

| Location | String |
| ----- | ----- |
| HUD | `Anggota` |
| HUD | `Online` |
| Drawer title | `Anggota tim` |
| Section title | `Supervisor` |
| Filter | `Semua` |
| Filter | `Online` |
| Filter | `Offline` |
| Search placeholder | `Cari nama atau email` |
| Presence Active | `Online` |
| Presence Away | `Away` |
| Presence Offline | `Offline` |
| Presence Unknown | `Tidak diketahui` |
| Last seen Active | `Aktif sekarang` |
| Last seen unavailable | `-` |
| Add action | `Tambah anggota` |
| Add modal title | `Tambah anggota ke tim` |
| Add modal confirm | `Tambahkan` |
| Add modal cancel | `Batal` |
| Already member | `Anggota sudah terdaftar` |
| Remove action | `Hapus dari tim` |
| Remove modal title | `Hapus anggota?` |
| Remove modal body | `User akan kehilangan akses ke Team Inbox ini.` |
| Remove modal confirm | `Hapus` |
| Remove modal cancel | `Batal` |
| Empty no members | `Belum ada anggota` |
| Empty no supervisors | `Belum ada supervisor` |
| Empty no results | `Tidak ada hasil` |
| Permission error | `Akses ditolak` |
| Add failed | `Gagal menambahkan anggota` |
| Remove failed | `Gagal menghapus anggota` |
| Retry | `Coba lagi` |
| Policy error last supervisor | `Minimal 1 supervisor harus tetap ada` |
| Auto-unassign in progress | `Perubahan assignee sedang diproses` |
| List updated | `Daftar anggota diperbarui` |

## **10\. Field & Validation**

| Field | Type | Validation | Required |
| ----- | ----- | ----- | ----- |
| Header HUD click | UI action | Disabled if user lacks Team Inbox access. | Yes |
| Drawer filter | Enum | Allowed: `Semua`, `Online`, `Offline`. Default: `Semua`. | Yes |
| Drawer search | String | Max 100 chars. Trim spaces. Debounce 300 ms. Case-insensitive. | No |
| Add member button | UI action | Visible only with manage membership permission. | Conditional |
| Add modal search | String | Max 100 chars. Debounce 300 ms. Case-insensitive. | No |
| Add modal selection | List | Min 1\. Max 50\. Disable users already in team. | Yes |
| Remove action | UI action | Visible only with manage membership permission. | Conditional |
| Remove confirmation | UI action | Must confirm before submit. | Yes |
| Last seen display | Derived string | Relative format only. Show `Aktif sekarang` for Active. Show `-` when unavailable. | Yes |

### **Relative last seen rules (English spec, UI output in Bahasa Indonesia)**

| Rule | Requirement |
| ----- | ----- |
| Units | Use minutes, hours, days. |
| Thresholds | 0 to 59 seconds shows `Baru saja`. 1 to 59 minutes shows `{x} menit lalu`. 1 to 23 hours shows `{x} jam lalu`. 1 to 30 days shows `{x} hari lalu`. Over 30 days shows `Lebih dari 30 hari lalu`. |
| Localization | All labels and units are Bahasa Indonesia only. |
| Timezone | Use tenant or user timezone consistently for computation. |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Drawer initial render under 1.0 second for 200 members on typical network conditions. |
| Real-time | Presence updates reflected within 2 seconds when live updates are available. |
| Reliability | Add and remove operations are idempotent and safe to retry without duplicates. |
| Security | Server-side authorization for drawer access and membership changes. |
| Privacy | Do not expose members from other Team Inboxes in drawer results. |
| Observability | Track presence availability rate and add/remove success and failure rates. |
| Accessibility | Full keyboard navigation. Focus order is HUD, drawer close, search, filters, list, and actions. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Presence availability and freshness | Engineering | Online count loses trust. | Fallback state. Instrument availability metrics. |
| Source of truth for Team Inbox membership | Engineering | Wrong list risks access leaks. | Server-side filtering and tests per Team Inbox. |
| Auto-unassign side effect correctness | Engineering | Inconsistent assignment states. | Transactional behavior or compensating retries with audit. |
| Last seen data quality | Engineering | Misleading relative time. | Clamp skew. Use `-` when unreliable. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Drawer open rate for supervisors | 80% weekly active supervisors open weekly | 30 days | Product analytics event `member_drawer_open` |
| Add member success rate | 90% | 30 days | Audit logs and analytics |
| Remove member success rate | 90% | 30 days | Audit logs and analytics |
| Median add or remove time | Under 45 seconds | 30 days | Funnel timing |
| Presence availability rate | 95% sessions have presence data | 30 days | Observability metrics |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Bulk add and remove across multiple Team Inboxes | Improves admin workflows for large orgs. |
| Display workload metrics in drawer | Helps staffing and escalation decisions. |
| Optional last seen tooltip with absolute time | Helps audit and precision without changing list compactness. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No creation of new users | Admin must create users elsewhere before adding to Team Inbox. |
| No role changes in drawer | Role management remains in dedicated settings. |
| Presence may be Unknown during outages | Online count may show `Online -` temporarily. |

## **16\. Appendix**

| Item | Details |
| ----- | ----- |
| Glossary | Team Inbox: a scoped inbox with assigned members. Presence: availability state of a member. Last seen: last time a member was active or last valid heartbeat. |
| Audit Events | `team_inbox.member_added` includes actor, team\_inbox\_id, target\_user\_ids, timestamp. `team_inbox.member_removed` includes actor, team\_inbox\_id, target\_user\_id, timestamp. `team_inbox.auto_unassign` includes actor, team\_inbox\_id, removed\_user\_id, affected\_conversation\_count, timestamp. |

