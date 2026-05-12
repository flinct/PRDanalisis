# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Team Member Management (List, Edit, Delete as Soft Delete)  
**Product Manager**: Yusril Ibnu  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1 | Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.1 | 2026-02-04 | Yusril Ibnu | init |

---

## **2 | Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Enable Admin to manage team members safely with list, edit actions, and delete (soft delete) that does not leave active work stuck. |
| Scope | Covers Member tab list and actions, Invited tab list actions, permission rules, and delete (soft delete) side effects. |

| In Scope | Out of Scope |
| ----- | ----- |
| Member list table with search, filters, pagination. | Add member invitation creation flow. |
| Row actions: change role, change password, change shift, delete member (soft delete). | Hard delete member. |
| Invited list actions: copy link, resend link, revoke invitation. | Restore deleted member. |
| Delete (soft delete) with auto unassign for active conversations and tickets. | Editing Team Inbox access from this page. |
| Guardrail: block deleting last active Admin. | Bulk edit and bulk delete. |

---

## **3 | Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Admin needs fast member visibility and filters to manage many users. | Slow operations and higher risk of misconfiguration. |
| 2 | Deleting a member can orphan active work. | SLA risk and operational downtime. |
| 3 | Admin needs critical edits like role, shift, and password reset. | Delays during incidents and operational changes. |

---

## **4 | Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Improve admin control for member management. | 95% of member changes completed in under 60 seconds. |
| Ensure safe delete without losing ownership. | 100% of active assigned conversations and tickets become unassigned after delete. |
| Prevent tenant lockout due to admin removal. | 0 cases of workspace having no active Admin due to delete. |

---

## **5 | User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to view a list of members with key attributes so that I can manage the team efficiently. | 1\. Given I open Settings and click **"Anggota tim"**, When the page loads, Then I see a table with columns **"Nama"**, **"Presence"**, **"Role"**, **"Jam shift"**, **"Batas assignment percakapan"**, **"Team inbox"**, and row actions. 2\. Given members exist, When I paginate, Then the table shows the correct next rows with consistent ordering. 3\. Given a member is deleted (soft delete), When the list loads, Then the member is not shown in the table. |
| US-002 | P0 | As an Admin, I want to search and filter members so that I can find specific users quickly. | 1\. Given the member list is shown, When I type in **"Cari anggota"**, Then the table updates to show matching name or email. 2\. Given the filters exist, When I select **"All Presence"**, Then the table updates to show only matching presence. 3\. Given the filters exist, When I select **"All Role"**, Then the table updates to show only matching role. 4\. Given the filters exist, When I select **"All Team inbox"**, Then the table updates to show only members assigned to that Team Inbox. 5\. Given a member is deleted (soft delete), When I search by their email, Then the member is not returned in results. |
| US-003 | P0 | As an Admin, I want to change a member role so that their access matches their responsibility. | 1\. Given I open a member row menu, When I click **"Ubah role"**, Then a modal appears with current role and a role selector. 2\. Given I select a new role, When I click **"Simpan"**, Then the member role is updated and reflected in the list. 3\. Given I do not change the role, When I click **"Simpan"**, Then the action is blocked and I see **"Tidak ada perubahan"**. |
| US-004 | P0 | As an Admin, I want to change a member password so that I can restore access if they forgot their credentials. | 1\. Given I open a member row menu, When I click **"Ubah kata sandi"**, Then a modal appears with fields **"Kata sandi baru"** and **"Ulangi kata sandi"**. 2\. Given the password is valid and matches confirmation, When I click **"Ubah kata sandi"**, Then the password is updated and the member is logged out from all sessions. 3\. Given the confirmation does not match, When I click **"Ubah kata sandi"**, Then I see **"Kata sandi tidak sama"** and nothing is saved. |
| US-005 | P1 | As an Admin, I want to change a member shift so that staffing matches operational needs. | 1\. Given I open a member row menu, When I click **"Ubah shift"**, Then a modal appears showing current shift and a shift selector. 2\. Given I select a new shift, When I click **"Simpan"**, Then the member shift is updated and reflected in the list. 3\. Given a member shift is not set, When the list loads, Then the shift column shows **"Default office hour"**. |
| US-006 | P0 | As an Admin, I want to delete a member (soft delete) so that they cannot access the system and active work is not stuck on them. | 1\. Given I open a member row menu, When I click **"Hapus anggota (soft delete)"**, Then a confirmation modal appears with a required checkbox. 2\. Given I confirm deletion, When I click **"Hapus anggota"**, Then the member cannot log in and all sessions are invalidated. 3\. Given the member has active assigned conversations, When deletion succeeds, Then those conversations become **Unassigned** and show UI label **"Belum ditugaskan"**. 4\. Given the member has active assigned tickets, When deletion succeeds, Then those tickets become **Unassigned** and show UI label **"Belum ditugaskan"**. 5\. Given auto round robin assignment is enabled, When items become unassigned, Then the assignment engine may reassign them automatically based on existing rules. 6\. Given auto round robin assignment is disabled, When items become unassigned, Then they remain unassigned until manually assigned. 7\. Given deletion succeeds, When I return to the list, Then the deleted member is not visible in the table. |
| US-007 | P0 | As an Admin, I want the system to prevent deleting the last active Admin so that the workspace remains manageable. | 1\. Given there is only one active Admin left, When I attempt to delete that Admin, Then the action is blocked and I see **"Tidak bisa menghapus Admin terakhir"**. 2\. Given there are at least two active Admins, When I delete an Admin, Then the action succeeds if all other validations pass. |
| US-008 | P1 | As an Admin, I want to manage invited members list so that I can control pending access safely. | 1\. Given I open the **"Invited"** tab, When the page loads, Then I see invited rows with **"Invite expiry"**, **"Role"**, and actions **"Kirim ulang link"**, **"Salin link"**, and **"Batalkan undangan"**. 2\. Given I click **"Batalkan undangan"**, When I confirm, Then the invite token is revoked and cannot be used. |

---

## **6 | Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Access Control | FR-001: System MUST allow only Admin to access **"Anggota tim"** settings page. FR-002: System MUST block non Admin access with **"Akses ditolak"**. FR-003: System MUST hide row actions for users without permission. |
| Member List | FR-004: System MUST show member list columns: Name, Email, Presence, Role, Shift hour, Conversation assignment limit, Team inbox. FR-005: System MUST support pagination with page size 25 rows. FR-006: System MUST apply default sort by Name ascending. FR-007: System MUST show Team Inbox values as chips and show overflow as **"+N"**. FR-008: System MUST exclude soft deleted members from the list response and UI rendering. |
| Search and Filters | FR-009: System MUST support search by member name and email. FR-010: System MUST provide filters: Presence, Role, Team Inbox. FR-011: System MUST persist last used filters for the session. FR-012: System MUST exclude soft deleted members from search and filter results. |
| Change Role | FR-013: Admin MUST be able to change a member role from row action **"Ubah role"**. FR-014: System MUST prevent saving if no role change occurs and show **"Tidak ada perubahan"**. FR-015: System MUST record audit log for role change. |
| Change Password | FR-016: Admin MUST be able to set a new password for another member from row action **"Ubah kata sandi"**. FR-017: System MUST invalidate all sessions of that member after password change. FR-018: System MUST record audit log for password change without storing plaintext. |
| Change Shift | FR-019: Admin MUST be able to change a member shift from row action **"Ubah shift"**. FR-020: System MUST show **"Default office hour"** if shift is not set or shift is unavailable. FR-021: System MUST record audit log for shift change. |
| Delete Member (Soft Delete) | FR-022: Admin MUST be able to delete a member using soft delete from row action **"Hapus anggota (soft delete)"**. FR-023: System MUST not support hard delete for members. FR-024: System MUST prevent login for soft deleted members. FR-025: System MUST invalidate all sessions for the member immediately after delete succeeds. FR-026: System MUST remove soft deleted member access from all Team Inboxes. FR-027: System MUST unassign all active conversations assigned to the member and set assignee state to Unassigned. FR-028: System MUST unassign all active tickets assigned to the member and set assignee state to Unassigned. FR-029: System MUST allow existing assignment engine to optionally reassign unassigned items if enabled. FR-030: System MUST remove the member from Member list UI after delete succeeds. FR-031: System MUST block deleting the last active Admin and show **"Tidak bisa menghapus Admin terakhir"**. FR-032: System MUST record audit log for delete including counts of conversations and tickets unassigned. |
| Invite Management | FR-033: System MUST show invited list with expiry date and role. FR-034: Admin MUST be able to copy invite link from **"Salin link"**. FR-035: Admin MUST be able to resend invite from **"Kirim ulang link"**. FR-036: Admin MUST be able to revoke invite from **"Batalkan undangan"** and invalidate token immediately. FR-037: System MUST record audit log for resend and revoke actions. |
| Data Integrity | FR-038: System MUST keep historical references to the deleted user in audit logs and historical assignment records. FR-039: System MUST support re inviting the same email after delete by creating a new member identity while keeping old historical references intact. |

---

## **7 | Error Handling**

| ID | Type | Handling | UI / UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission | Block access and show message. | "Akses ditolak" |
| EH-002 | Network | Show retry state for list fetching. | "Gagal memuat data. Coba lagi." |
| EH-003 | Validation | Block save when no role change. | "Tidak ada perubahan" |
| EH-004 | Validation | Block password change when mismatch. | "Kata sandi tidak sama" |
| EH-005 | Validation | Block password change when too short. | "Minimal 8 karakter" |
| EH-006 | Guardrail | Block last active Admin delete. | "Tidak bisa menghapus Admin terakhir" |
| EH-007 | Server | Failed update role, shift, password. | "Gagal menyimpan. Silakan coba lagi." |
| EH-008 | Server | Failed delete member operation. | "Gagal menghapus anggota. Silakan coba lagi." |
| EH-009 | Server | Failed unassign after delete attempt. | "Gagal memindahkan assignment. Silakan coba lagi." |
| EH-010 | Invited | Failed resend invitation. | "Gagal mengirim ulang. Silakan coba lagi." |
| EH-011 | Invited | Failed revoke invitation. | "Gagal membatalkan undangan. Silakan coba lagi." |

---

## **8 | Edge Cases**

| ID | Scenario | Expected Behavior | UI / UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EC-001 | Delete member with 0 active assignments. | Delete succeeds. No unassign jobs executed. | "Anggota berhasil dihapus" |
| EC-002 | Delete member currently logged in. | Force logout on all devices. | "Anggota berhasil dihapus" |
| EC-003 | Delete member while auto round robin enabled. | Items become unassigned first. Assignment engine may reassign next. | "Anggota berhasil dihapus" |
| EC-004 | Delete member while list is filtered. | Row is removed from table after success even if filters match. | N/A |
| EC-005 | Concurrent Admin actions on same member. | First successful delete wins. Subsequent edits fail. | "Anggota sudah dihapus" |
| EC-006 | Delete member referenced as assignee in historical conversation or ticket. | Show historical name in readonly context. Do not allow selection as assignee. | "Anggota sudah dihapus" |
| EC-007 | Re invite same email after delete. | New member created with new identity. Old identity remains soft deleted. | "Undangan berhasil dikirim" |
| EC-008 | Delete member that is last active Admin. | Block delete. | "Tidak bisa menghapus Admin terakhir" |

---

## **9 | UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Settings Navigation | Settings left nav includes **"Anggota tim"**. Only visible to Admin. | 1\. Admin opens Settings. 2\. Admin clicks **"Anggota tim"**. 3\. Page loads member list. | US-001 |
| Member Tab Table | Table shows member rows and key columns. Row menu includes actions. Deleted members never appear. | 1\. Page shows loading skeleton. 2\. Table loads rows. 3\. Admin opens row menu. 4\. Admin picks action. | US-001, US-003, US-004, US-005, US-006 |
| Search and Filters | Search input **"Cari anggota"** and filters **"All Presence"**, **"All Role"**, **"All Team inbox"**. | 1\. Admin types in search. 2\. Admin selects filters. 3\. Table updates results. | US-002 |
| Change Role Modal | Modal title **"Ubah role anggota"**. Current role read only. Role selector. Primary button **"Simpan"**. | 1\. Admin clicks **"Ubah role"**. 2\. Admin selects new role. 3\. Admin clicks **"Simpan"**. 4\. Toast shown. | US-003 |
| Change Password Modal | Modal title **"Ubah kata sandi anggota"**. Fields: **"Kata sandi baru"**, **"Ulangi kata sandi"**. Primary button **"Ubah kata sandi"**. | 1\. Admin clicks **"Ubah kata sandi"**. 2\. Admin enters password twice. 3\. Admin clicks **"Ubah kata sandi"**. 4\. Toast shown. | US-004 |
| Change Shift Modal | Modal title **"Ubah shift anggota"**. Current shift read only. Shift selector. Primary button **"Simpan"**. | 1\. Admin clicks **"Ubah shift"**. 2\. Admin selects shift. 3\. Admin clicks **"Simpan"**. 4\. Toast shown. | US-005 |
| Delete Modal | Modal title **"Hapus anggota (soft delete)"**. Required checkbox enables danger CTA. | 1\. Admin clicks **"Hapus anggota (soft delete)"**. 2\. Admin checks **"Saya mengerti dan setuju menghapus anggota ini."**. 3\. Admin clicks **"Hapus anggota"**. 4\. Toast shown and row removed. | US-006, US-007 |
| Invited Tab Table | Shows invited members with expiry and actions: **"Kirim ulang link"**, **"Salin link"**, **"Batalkan undangan"**. | 1\. Admin clicks **"Invited"** tab. 2\. Table loads invited list. 3\. Admin uses row actions. | US-008 |
| Empty States | Member list empty and invited list empty. | Member empty: **"Belum ada anggota"**. Invited empty: **"Belum ada undangan"**. | US-001, US-008 |
| Success Toasts | Standard success toast for all actions. | Role: **"Role berhasil diubah"**. Password: **"Kata sandi berhasil diubah"**. Shift: **"Shift berhasil diubah"**. Delete: **"Anggota berhasil dihapus"**. | US-003, US-004, US-005, US-006 |

---

## **10 | Field & Validation**

| Field | Type | Validation | Required | UI Label (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- | ----- |
| Search | Text | Max 100 chars. Debounce 300 ms. | Optional | "Cari anggota" |
| Presence Filter | Enum | Values reflect presence system states. | Optional | "All Presence" |
| Role Filter | Enum | Values reflect available roles. | Optional | "All Role" |
| Team Inbox Filter | Enum | Values reflect accessible Team Inboxes. | Optional | "All Team inbox" |
| Role Selector | Enum | Must be a valid role. Cannot be empty. | Required | "Pilih role baru" |
| New Password | Password | Min 8 chars. Max 64 chars. | Required | "Kata sandi baru" |
| Confirm Password | Password | Must match New Password. | Required | "Ulangi kata sandi" |
| Shift Selector | Enum | Must be a valid shift. Cannot be empty. | Required | "Pilih shift" |
| Delete Checkbox | Checkbox | Must be checked to enable danger CTA. | Required | "Saya mengerti dan setuju menghapus anggota ini." |

---

## **11 | Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Member list initial load under 2 seconds for 1,000 members. |
| Availability | Member management actions available 99.9% monthly. |
| Security | Password updates never expose passwords in logs or UI. |
| Auditability | 100% of role, password, shift, delete, resend, revoke actions are logged. |
| Accessibility | Keyboard navigation for row menu and modals. Focus trap inside modals. |

---

## **12 | Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Assignment engine auto round robin configuration. | Engineering | Unassigned items may not be reassigned as expected. | Respect existing settings and document behavior. |
| Presence state source of truth. | Engineering | Presence filter and display may be inconsistent. | Read only integration with existing presence system. |
| Email reuse behavior after delete. | Product, Engineering | Confusing duplicates if not specified. | Enforce new identity per invite. Keep historical references. |
| Last Admin detection correctness. | Engineering | Tenant lockout risk. | Enforce server side validation before delete. |

---

## **13 | Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Member page load time | p95 under 2 seconds | 30 days post launch | Frontend performance logs |
| Delete success rate | 99% | 30 days post launch | Audit logs |
| Unassign completeness | 100% of active items unassigned | 30 days post launch | Assignment logs |
| Admin lockout incidents | 0 | 90 days post launch | Support tickets |

---

## **14 | Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Deleted members view | Enables audits and troubleshooting without DB access. |
| Restore member | Reduces friction if delete was accidental. |
| Bulk actions | Faster operations for large teams. |
| Edit Team Inbox access on member page | Reduces admin steps during reorg. |

---

## **15 | Limitations**

| Limitation | Impact |
| ----- | ----- |
| No hard delete | Data remains in DB for audit and historical reference. |
| No restore | Admin cannot recover a deleted member from UI. |
| No deleted members list | Admin cannot view deleted members in UI. |
| No bulk edit or bulk delete | Admin must update one member at a time. |

---

## **16 | Appendix**

| Item | Details |
| ----- | ----- |
| Glossary | Soft delete: member removed from UI and access is revoked, but record remains in DB for audit and historical references. |

