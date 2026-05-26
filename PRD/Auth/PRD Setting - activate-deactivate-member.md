# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Activate / Deactivate Member (Toggle User Active Status)  
**Product Manager**: Dany Christian
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1 | Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes                                                                                                                                                                        |
| ------- | ------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v1.0    | 2026-05-25          | Agent  | init                                                                                                                                                                           |
| v1.1    | 2026-05-25          | Agent  | Added AUX & Round Robin impact analysis, mobile apps usage, soft delete vs deactivate distinction.                                                                             |
| v1.2    | 2026-05-25          | Agent  | Added member visibility rules: deactivated members appear in member list but excluded from assignment/search contexts. Clarified Auth `isActive` vs Member `isActive` duality. |

---

## **2 | Overview**

| Item    | Description                                                                                                                                                                                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose | Provide Admin with the ability to deactivate a member so they cannot log in with their credentials, and reactivate a deactivated member to restore access. This also serves as the unregistration endpoint for IOS and mobile app channel integration.            |
| Scope   | Covers the toggle active status endpoint in Auth Service (BE), the REST API in API Gateway, the UI action in Member Settings page (FE), the authentication guard (isActive check at login/refresh), and impact analysis on AUX status and Round Robin assignment. |

| In Scope                                                                      | Out of Scope                                                                     |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Toggle `isActive` field on Auth schema via gRPC endpoint.                     | Soft delete member (existing, separate feature).                                 |
| REST endpoint `PATCH /auth/member/:id/toggle-active-status` on API Gateway.   | Hard delete member.                                                              |
| Deactivation: force logout (delete all sessions + invalidation reason toast). | Restore soft-deleted member.                                                     |
| Reactivation: set `isActive = true`, member can login again.                  | Suspension (isSuspend tenant-level).                                             |
| Login guard: block login when `isActive = false`.                             | Bulk toggle.                                                                     |
| Refresh token guard: block token refresh when `isActive = false`.             | Audit log (existing infrastructure).                                             |
| FE action: toggle button in member table row menu.                            | Email notification on deactivation.                                              |
| FE modal: confirmation modal before toggle.                                   | Activity log for deactivation/reactivation events.                               |
| FE guard: hide/show UI based on `isActive` field.                             | Unassign conversations/tickets (this is soft delete behavior, NOT deactivation). |
| Mobile app unregister endpoint.                                               | Remove member from team inboxes (this is soft delete behavior).                  |
|                                                                               | Close open AUX intervals (member stays as AWAY on record, no auto transition).   |

### 2.1 Deactivate vs Soft Delete

| Aspect                  | Deactivate (`isActive = false`)                          | Soft Delete (`isDeleted = true`)                     |
| ----------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| Login access            | Revoked                                                  | Revoked                                              |
| Active sessions         | Deleted (force logout)                                   | Deleted (force logout)                               |
| Conversations           | **Preserved** — member remains as assigned participant   | **Unassigned** — all conversations become unassigned |
| Tickets                 | **Preserved** — member remains as assigned participant   | **Unassigned** — all tickets become unassigned       |
| Team inbox membership   | **Preserved** — member stays in teams                    | **Removed** — member removed from all teams          |
| AUX / Status            | **Preserved** — member's AWAY/READY state is not touched | **Not applicable** — member record is deleted        |
| Round Robin eligibility | Disabled (member has no active session to pull)          | Disabled (member no longer exists)                   |
| Reversible from UI      | Yes — Admin can reactivate                               | No — cannot be restored from UI                      |
| Last Admin guard        | No guard — allowed (workspace may lose Admin access)     | Guarded — blocks deleting last active Admin          |

> **Key principle:** Deactivation is a **lightweight credential revocation**. It does NOT clean up assignments, teams, or operational data. Soft delete is a **full offboarding** that reassigns all active work and removes the member from the team.

---

## **3 | Problem Statement**

| #   | Problem Description                                                                                                                | Impact                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | Admin cannot temporarily prevent a member from logging in without soft-deleting them, which is irreversible from the UI.           | Admin must use DB-level changes to handle offboarding, security incidents, or role transitions. |
| 2   | IOS and Mobile channels require an unregistration endpoint to deactivate users when they unregister from the device.               | No API endpoint exists for programmatic deactivation, blocking mobile/IOS integration.          |
| 3   | Once a member is deactivated via `MEMBER_DELETED` event, there is no way to reactivate them through the system.                    | A deleted member cannot be restored; Admin must re-invite from scratch.                         |
| 4   | Soft delete (current only option) has heavy side effects — unassigns conversations, removes from teams — which is too aggressive.  | Admin cannot distinguish between "temporary access revoke" and "full offboarding".              |
| 5   | AUX status and Round Robin eligibility are not considered when deactivating — member may remain in AWAY state with open intervals. | Open AUX intervals may cause incorrect SLA/pause calculations and analytics distortions.        |

---

## **4 | Objectives and Key Results**

| Objective                                                     | Key Result (Target)                                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Enable Admin-controlled member deactivation and reactivation. | 100% of member toggle actions succeed without data loss.                 |
| Prevent deactivated users from authenticating.                | 0% of deactivated users can login or refresh tokens.                     |
| Provide clear feedback on member active status.               | Member list UI shows `isActive` status with appropriate label and color. |

---

## **5 | User Stories and Acceptance Criteria**

### P0 — Auth Service & API Gateway

| ID     | Priority | User Story                                                                                                                    | Acceptance Criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-001 | P0       | As an Admin, I want to deactivate a member so that they cannot log in with their current credentials.                         | 1. Given I am an Admin with `member:update` permission, When I toggle a member to deactivated, Then the system sets `isActive = false` on the Auth record. 2. Given a member is deactivated, When they attempt to log in, Then the system shows "Akun dinonaktifkan" and blocks authentication. 3. Given a member is deactivated, When they attempt to refresh their token, Then the system blocks the request and returns an unauthorized error. 4. Given a member is deactivated, When checking their AUX intervals, Then no existing open intervals are closed (AUX is not affected). 5. Given a member is deactivated, When checking their assigned conversations, Then they remain as a participant (no unassignment). |
| US-002 | P0       | As an Admin, I want to reactivate a deactivated member so that they can log in again.                                         | 1. Given I am an Admin with `member:update` permission, When I toggle a deactivated member to active, Then the system sets `isActive = true` on the Auth record. 2. Given a member is reactivated, When they attempt to log in with correct credentials, Then the system allows authentication and creates a new session. 3. Given a member is reactivated, When checking their team inbox memberships, Then they remain unchanged (no re-add needed).                                                                                                                                                                                                                                                                      |
| US-003 | P0       | As a deactivated member, I want to be force-logged out immediately so that I cannot continue using the system.                | 1. Given a member is currently logged in with active sessions, When an Admin deactivates that member, Then all active sessions are deleted and the member is force-logged out. 2. Given a member is force-logged out due to deactivation, When they make any subsequent request with the old token, Then the system returns an unauthorized error. 3. Given a member is force-logged out, When they view the login page, Then they see a toast notification "Sesi Anda telah berakhir karena akun Anda dinonaktifkan."                                                                                                                                                                                                      |
| US-004 | P0       | As a mobile app system (IOS/Android), I want an API endpoint to deactivate a user so that I can handle device unregistration. | 1. Given a mobile app sends an unregister request with a valid user ID and auth token, When the system processes the request, Then the user's `isActive` is set to `false` and all sessions are deleted. 2. Given the mobile app calls the endpoint with an invalid or non-existent user ID, When the system processes the request, Then it returns a 404 error without making any state changes. 3. Given the mobile app calls the endpoint without proper authentication, When the system processes the request, Then it returns a 401 error. 4. Given a mobile user has unregistered, When they attempt to log in again from a new device, Then they must be reactivated first by an Admin.                              |

### P0 — AUX & Round Robin Awareness

| ID     | Priority | User Story                                                                                                                                           | Acceptance Criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-005 | P0       | As a System, I want AUX intervals to remain intact when a member is deactivated so that historical analytics and SLA calculations are not distorted. | 1. Given a member has an open AUX interval (currently AWAY), When an Admin deactivates that member, Then the open AUX interval remains open (no auto-close). 2. Given a member has historical closed AUX intervals, When an Admin deactivates that member, Then historical AUX data is preserved and accessible in analytics. 3. Given a deactivated member is reactivated, When they log in, Then their AUX state is LOGOUT (they must explicitly set READY again).                                                   |
| US-006 | P0       | As a System, I want Round Robin auto-assignment to exclude deactivated members so that no new conversations are assigned to them.                    | 1. Given a member is deactivated, When the auto-pull engine runs (`autoPullConversation`), Then `isMemberAvailableForAutoPull()` returns `false` for that member. 2. Given a member is deactivated, When they have a READY status in the cache, Then the auto-pull engine still excludes them (deactivation takes precedence over status). 3. Given a member is reactivated, When the auto-pull engine runs, Then they become eligible again if other conditions are met (READY status, within hours, slot available). |

### P1 — UI & UX Adjustments

| ID     | Priority | User Story                                                                                                                                                                   | Acceptance Criteria                                                                                                                                                                                                                                                                                                                                                                |
| ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-007 | P1       | As an Admin, I want to see the active status of each member in the member list so that I can identify deactivated accounts.                                                  | 1. Given the member list is loaded, When a member has `isActive = true`, Then their row shows a badge or indicator "Aktif" with a green color. 2. Given the member list is loaded, When a member has `isActive = false`, Then their row shows a badge or indicator "Nonaktif" with a red/gray color.                                                                               |
| US-008 | P1       | As an Admin, I want to toggle a member's active status from the member row menu so that I can quickly deactivate or reactivate them.                                         | 1. Given I open the row menu for an active member, When I see the action list, Then I see a "Nonaktifkan anggota" option. 2. Given I open the row menu for a deactivated member, When I see the action list, Then I see an "Aktifkan anggota" option. 3. Given I click the toggle action, When a confirmation modal appears, Then I can confirm or cancel the action.              |
| US-009 | P1       | As an Admin, I want the deactivation confirmation modal to clearly state that existing assignments are preserved so I understand it's not a full offboarding.                | 1. Given I click "Nonaktifkan anggota", When the confirmation modal appears, Then it includes text "Anggota tetap terdaftar di tim dan percakapan yang sedang berlangsung tidak terpengaruh." 2. Given I click "Aktifkan anggota", When the confirmation modal appears, Then it includes text "Anggota akan dapat masuk kembali setelah diaktifkan."                               |
| US-010 | P1       | As an Admin, I want deactivated members to still appear in the member list so that I can see all team members regardless of status.                                          | 1. Given a member is deactivated (auth `isActive = false`, member `isActive = true`), When the Admin opens the member settings page, Then the deactivated member is visible in the table with a "Nonaktif" badge. 2. Given a member is soft-deleted (`isDeleted = true`), When the Admin opens the member settings page, Then the soft-deleted member is NOT visible in the table. |
| US-011 | P1       | As an Admin assigning a conversation or ticket, I want deactivated members to be excluded from the selection list so that I cannot assign work to someone who cannot log in. | 1. Given I open the assignee dropdown for a conversation or ticket, When the member list loads, Then members with `isActive = false` (deactivated) are NOT shown in the list. 2. Given I search for a deactivated member by name in the assignee search, When the results load, Then the deactivated member is NOT returned in the search results.                                 |

---

## **6 | Functional Requirements**

### P0 — Auth Service (BE)

| ID     | Category                     | Requirement                                                                                                                                                                                                                                   |
| ------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-001 | gRPC Endpoint                | Auth Service MUST provide a gRPC RPC `ToggleUserActiveStatus(ToggleActiveStatusRequest) returns (common.Success)` in `auth.proto`.                                                                                                            |
| FR-002 | gRPC Request                 | `ToggleActiveStatusRequest` MUST contain fields: `userId` (string) and `isActive` (bool).                                                                                                                                                     |
| FR-003 | Auth Update                  | System MUST update the `isActive` field on the Auth document to the requested value.                                                                                                                                                          |
| FR-004 | Deactivation Side Effect     | When setting `isActive = false`, system MUST delete all active sessions for that user via `sessionService.deleteAllSessionsByUserId()`.                                                                                                       |
| FR-005 | Deactivation Side Effect     | When setting `isActive = false`, system MUST set session invalidation reason to `MEMBER_DEACTIVATED` via `sessionService.setSessionInvalidationReason()`.                                                                                     |
| FR-006 | Reactivation                 | When setting `isActive = true`, system MUST NOT delete sessions (the user will create new ones on next login).                                                                                                                                |
| FR-007 | Login Guard                  | `LocalStrategy.validateAccountStatus()` MUST reject authentication with `UnauthorizedException` and message "Akun dinonaktifkan" when `auth.isActive === false`.                                                                              |
| FR-008 | Refresh Guard                | `RefreshTokenStrategy.validateAccountStatus()` MUST reject token refresh with `UnauthorizedException` and message "Akun dinonaktifkan" when `auth.isActive === false`.                                                                        |
| FR-009 | Existing User                | System MUST return 404 error if no Auth record is found for the provided userId.                                                                                                                                                              |
| FR-010 | Idempotency                  | System MUST accept a toggle request even if the target `isActive` value is already set (no-op), returning success without side effects.                                                                                                       |
| FR-011 | AUX Preservation             | Deactivation MUST NOT close any open AUX intervals, delete historical AUX data, or modify the agent's current AWAY/READY status. AUX data remains intact for analytics and SLA calculations.                                                  |
| FR-012 | Conversation Preservation    | Deactivation MUST NOT unassign the member from any conversations or tickets. The member remains as a participant on all currently assigned items.                                                                                             |
| FR-013 | Team Membership Preservation | Deactivation MUST NOT remove the member from any team inbox. The member remains as a team member but cannot log in.                                                                                                                           |
| FR-014 | Round Robin Exclusion        | Auto-pull engine (`autoPullConversation`) MUST exclude deactivated members from eligibility checks. `isMemberAvailableForAutoPull()` MUST return `false` when `isActive = false` regardless of agent status, shift hours, or available slots. |
| FR-015 | Auth isActive Only           | Deactivation ONLY toggles the `isActive` field on the Auth schema. It does NOT change the `isActive` field on the Member schema (people-service). The two fields are independent.                                                             |

### 6.1 Member Visibility Rules — Deactivated vs Soft-Deleted

**Key concept:** There are two separate `isActive` fields in the system:

- **Auth `isActive`** (auth-service) — controls login access. Toggled by deactivate/reactivate.
- **Member `isActive`** (people-service) — currently set to `false` only during soft delete. NOT toggled by deactivate.

This means deactivated members (auth `isActive = false`) still have member `isActive = true`, so they will appear in member list queries unless filtered out.

| Context                                                        | Deactivated (auth isActive=false)            | Soft-Deleted (member isDeleted=true)                |
| -------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------- |
| **Member Settings page** (member list)                         | **Visible** — shown as "Nonaktif"            | **Hidden** — excluded by `isDeleted: { $ne: true }` |
| **Conversation/Ticket assignment** (assignee dropdown, search) | **Hidden** — should not appear as assignable | **Hidden** — excluded                               |
| **Team inbox member list**                                     | **Visible** — still a team member            | **Hidden** — removed from all teams                 |
| **Round Robin auto-pull**                                      | **Excluded** — FR-014                        | **Excluded**                                        |
| **Get member by ID**                                           | **Visible** — can be fetched by ID           | **Hidden** — excluded by `isDeleted: { $ne: true }` |

#### Implementation Approach

**Current state (before feature):**

- API Gateway `GET /member` defaults to `isActive: true` (line 140 of `member.controller.ts`)
- This means only members with `member.isActive = true` are returned
- Since deactivation doesn't exist yet, this only filters out soft-deleted members (which have `member.isActive = false`)

**After feature:**

- Deactivated members have `auth.isActive = false` but `member.isActive = true`
- `GET /member` (member settings page) — MUST remove the `isActive: true` default filter to show deactivated members too
- Assignment/search contexts — MUST explicitly pass `isActive: true` to exclude deactivated members

**Specific changes required:**

| Layer                          | File                                                                                | Change                                                                                                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BE API Gateway**             | `apps/api-gateway/src/app/member/member.controller.ts` (line 140)                   | Change `isActive: query.isActive ?? true` → `isActive: query.isActive` (remove default). If `isActive` is not provided, the BE will not filter by it, returning all non-deleted members (active + deactivated). |
| **BE API Gateway**             | `apps/api-gateway/src/app/member/dto/get-members.dto.ts`                            | Add `isActive?: boolean` to `GetMemberDto` if not already present.                                                                                                                                              |
| **FE - Member Page**           | `apps/omnichannel/components/molecules/member/TableFilters.tsx` or page component   | Do NOT pass `isActive` param — let BE return all members. The table will show "Aktif"/"Nonaktif" badge.                                                                                                         |
| **FE - Ticket Assignable**     | `apps/omnichannel/services/member/use-get-ticket-assignable-member-list.service.ts` | Add `params.isActive = true` to the API call so deactivated members are excluded from ticket assignment.                                                                                                        |
| **FE - Conversation Assign**   | Find conversation assign/search component                                           | Add `isActive: true` to the API call for conversation assignment dropdowns.                                                                                                                                     |
| **FE - Other search contexts** | All member search/select components used outside member settings                    | Add `isActive: true` to ensure deactivated members are not shown.                                                                                                                                               |

### P0 — API Gateway (BE)

| ID     | Category       | Requirement                                                                                                                     |
| ------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| FR-015 | REST Endpoint  | API Gateway MUST expose `PATCH /auth/member/:id/toggle-active-status` that delegates to `authService.toggleUserActiveStatus()`. |
| FR-016 | Request Body   | Endpoint MUST accept JSON body `{ "isActive": boolean }`.                                                                       |
| FR-017 | Authentication | Endpoint MUST be protected by `JwtAuthGuard`.                                                                                   |
| FR-018 | Authorization  | Endpoint MUST require `MemberSettingPermission.UPDATE` via `@RequirePermissions()`.                                             |
| FR-019 | Response       | Endpoint MUST return `{ "message": string, "success": true }` on success.                                                       |

### P0 — Member Visibility (BE)

| ID     | Category            | Requirement                                                                                                                                                                                                                                                                        |
| ------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-020 | API Gateway Default | API Gateway `GET /member` MUST remove the `isActive: true` default filter. Change from `isActive: query.isActive ?? true` to `isActive: query.isActive`. When `isActive` is not provided, the BE MUST NOT filter by it — returning all non-deleted members (active + deactivated). |
| FR-021 | Member Repository   | `member.repository.ts` `getPaginatedMembers()` already has `buildMemberFilter()` that only adds `isActive` filter when explicitly provided (line 325-327). No change needed — the proto field `optional bool isActive = 3` already supports this.                                  |
| FR-022 | Get Member by ID    | `member.repository.ts` `findMembersByIds()` currently filters by `isActive: true` (line 111). This MUST be changed to NOT filter by `isActive`, so deactivated members can still be fetched by ID for display/reference purposes. Only `isDeleted: { $ne: true }` should remain.   |
| FR-023 | Assignment Contexts | All contexts that require only ACTIVE members (conversation assignment, ticket assignment, assignee search dropdowns) MUST explicitly pass `isActive: true` to the `GET /member` API call.                                                                                         |

### P1 — Frontend

| ID     | Category                   | Requirement                                                                                                                                                                                                                                                                |
| ------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-024 | Member Type                | FE `Member` type already includes `isActive: boolean` — no change needed.                                                                                                                                                                                                  |
| FR-025 | API Hook                   | `useManageMemberAPIRequest` hook MUST add method `toggleMemberActiveStatus(memberId: string, isActive: boolean)`.                                                                                                                                                          |
| FR-026 | Service                    | A new service `action-toggle-active-member.ts` MUST expose `useActionToggleActiveMember()` mutation hook.                                                                                                                                                                  |
| FR-027 | Store                      | `useMemberStore` MUST add modal state for `toggleActiveStatusModal` and `selectedMemberForToggle`.                                                                                                                                                                         |
| FR-028 | Table Row Action           | `PopoverOption` in `TableMember.tsx` MUST show "Nonaktifkan anggota" for active members and "Aktifkan anggota" for inactive members.                                                                                                                                       |
| FR-029 | Status Column              | Member table MUST show a status column with badge "Aktif" (green) or "Nonaktif" (red/gray).                                                                                                                                                                                |
| FR-030 | Confirmation Modal         | Toggling MUST show a confirmation modal before executing the action. Deactivation modal MUST note: "Anggota tetap terdaftar di tim dan percakapan yang sedang berlangsung tidak terpengaruh."                                                                              |
| FR-031 | Toast Notification         | On success, system MUST show a toast: "Anggota berhasil dinonaktifkan" or "Anggota berhasil diaktifkan".                                                                                                                                                                   |
| FR-032 | Translation Keys           | i18n MUST add keys for: `tableMember.action.deactivate`, `tableMember.action.activate`, `modalToggleActive.title`, `modalToggleActive.description.deactivate`, `modalToggleActive.description.activate`, `modalToggleActive.note`, `toast.deactivated`, `toast.activated`. |
| FR-033 | Member List Visibility     | FE member settings page (`TableMembers.tsx`) MUST call `GET /member` WITHOUT the `isActive` parameter, so deactivated members are also returned and shown with "Nonaktif" badge.                                                                                           |
| FR-034 | Assignable List Filter     | `useGetTicketAssignableMemberList` service MUST add `params.isActive = true` when calling `GET /member`, so deactivated members are excluded from ticket assignment lists.                                                                                                 |
| FR-035 | Conversation Assign Filter | Conversation assignee search/select components MUST add `isActive: true` to member list API calls, so deactivated members are excluded from conversation assignment.                                                                                                       |

---

## **7 | Error Handling**

| ID     | Type                | Handling                                 | UI / UX (Bahasa Indonesia)                                 |
| ------ | ------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| EH-001 | Permission          | Block non-Admin access.                  | "Akses ditolak"                                            |
| EH-002 | Validation          | User ID not found.                       | "Anggota tidak ditemukan"                                  |
| EH-003 | Network             | Failed to update status.                 | "Gagal memperbarui status anggota. Silakan coba lagi."     |
| EH-004 | Server              | Internal server error.                   | "Terjadi kesalahan. Silakan coba lagi."                    |
| EH-005 | Login (deactivated) | Block login for deactivated user.        | "Akun dinonaktifkan. Silakan hubungi Admin."               |
| EH-006 | Force Logout        | Session invalidated due to deactivation. | "Sesi Anda telah berakhir karena akun Anda dinonaktifkan." |

---

## **8 | Edge Cases**

| ID     | Scenario                                                                                                               | Expected Behavior                                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| EC-001 | Deactivate a member who is currently logged in on multiple devices.                                                    | All sessions are deleted; member is force-logged out from all devices.                                                        |
| EC-002 | Reactivate a member who was deactivated.                                                                               | Member can log in normally; no sessions are restored (user must re-authenticate).                                             |
| EC-003 | Toggle a member that was already in the target state (e.g., deactivate an already-deactivated member).                 | System returns success (idempotent); no side effects (no duplicate session deletion).                                         |
| EC-004 | Toggle the last active Admin.                                                                                          | Allowed (unlike soft delete). Admin can be deactivated even if they are the last Admin. Warning: this may lock the workspace. |
| EC-005 | Concurrent toggle requests for the same member from two different Admins.                                              | Last write wins (standard MongoDB behavior). Both requests return success.                                                    |
| EC-006 | Deactivate a member that has no Auth record.                                                                           | System returns 404 "Anggota tidak ditemukan".                                                                                 |
| EC-007 | Mobile app sends deactivation request for an already-deactivated user.                                                 | System returns success (idempotent).                                                                                          |
| EC-008 | Member attempts to login immediately after being deactivated (before session deletion propagates).                     | Login guard (`isActive` check) runs before session check; login is rejected regardless of session state.                      |
| EC-009 | Deactivate a member who has an open AUX interval (currently AWAY).                                                     | Open AUX interval remains open; SLA pause/resume behavior unchanged; analytics data preserved.                                |
| EC-010 | Reactivate a member who was deactivated while AWAY.                                                                    | Member's status is LOGOUT on next login. They must explicitly set READY again. No auto-recovery of AWAY state.                |
| EC-011 | Round Robin triggers auto-pull for an unassigned conversation after a deactivated member was the only available agent. | Auto-pull skips the deactivated member; if no other available agent, conversation remains unassigned until next trigger.      |
| EC-012 | Deactivate a member who has active conversations at their `maxConversation` limit.                                     | Deactivation succeeds; conversations remain assigned; `maxConversation` is not auto-adjusted.                                 |
| EC-013 | Mobile app sends deactivation request using the user's own auth token (self-deactivation on uninstall).                | Deactivation succeeds; user is force-logged out. The mobile app cannot make further authenticated requests.                   |

---

## **9 | UI & UX Requirements**

| ID     | Component          | Description                                                                                  | UX Flow                                                                                                                                                            | Related User Story IDs |
| ------ | ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| UI-001 | Status Badge       | Show "Aktif" (green badge) or "Nonaktif" (gray/red badge) for each member row in the table.  | 1. Member list loads. 2. System reads `isActive` from Member object. 3. Badge rendered with appropriate color and text.                                            | US-005                 |
| UI-002 | Row Menu Action    | "Nonaktifkan anggota" for active members; "Aktifkan anggota" for inactive members.           | 1. Admin opens row menu (three dots). 2. Menu shows toggle action based on current `isActive` state. 3. Admin clicks action.                                       | US-006                 |
| UI-003 | Confirmation Modal | Modal title "Nonaktifkan anggota" or "Aktifkan anggota" with description and confirm button. | 1. Admin clicks toggle action. 2. Modal appears with message. 3. Admin confirms or cancels. 4. On confirm, API called; on success, toast shown and list refreshed. | US-006                 |
| UI-004 | Success Toast      | Toast notification shown after toggle succeeds.                                              | 1. API returns success. 2. Toast "Anggota berhasil dinonaktifkan" or "Anggota berhasil diaktifkan" shown. 3. Table row refreshed to reflect new status.            | US-006                 |

---

## **10 | Field & Validation**

| Field      | Location      | Type    | Validation                                 | Required | UI Label (Bahasa Indonesia) |
| ---------- | ------------- | ------- | ------------------------------------------ | -------- | --------------------------- |
| `isActive` | Auth schema   | Boolean | Must be `true` or `false`. Default `true`. | Yes      | Status akun                 |
| `userId`   | Request param | MongoId | Must be a valid 24-character hex string.   | Yes      | ID anggota                  |
| `isActive` | Request body  | Boolean | Must be `true` or `false`.                 | Yes      | Aktifkan / Nonaktifkan      |

---

## **11 | Non-Functional Requirements**

| Category     | Requirement                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| Performance  | Toggle action MUST complete in under 500ms for a single user under normal load.                                 |
| Security     | Toggle action MUST be gated behind `JwtAuthGuard` + `@RequirePermissions([MemberSettingPermission.UPDATE])`.    |
| Auditability | Toggle action SHOULD be logged via existing audit infrastructure (event emission pattern).                      |
| Availability | Toggle action MUST be available 99.9% of the time.                                                              |
| Consistency  | `isActive` changes MUST take effect immediately — no caching of `isActive` field beyond the Auth document read. |

---

## **12 | Dependencies & Risks**

| ID     | Dependency or Risk                             | Type       | Impact                                                                                                     | Mitigation                                                                                                                                              |
| ------ | ---------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DR-001 | Session service dependency                     | Dependency | If session deletion fails, deactivated user may still have active sessions briefly.                        | Implement try/catch and log failure; token validation on each request will still block access.                                                          |
| DR-002 | Mobile/IOS integration timing                  | Risk       | Mobile app may send deactivation before member is fully onboarded.                                         | Ensure endpoint works for any auth record with a valid userId regardless of onboarding status. Ensure user has valid JWT (no public access).            |
| DR-003 | Last Admin deactivation                        | Risk       | Workspace may have no active Admin if the last Admin is deactivated.                                       | Document this risk; allow it (unlike soft delete which blocks last Admin deletion). Consider a warning in the confirmation modal.                       |
| DR-004 | AUX intervals left open on deactivated members | Risk       | Open AWAY intervals may cause incorrect SLA pause/resume behavior if the member never returns.             | This is acceptable — SLA will remain paused while ALL participants are AWAY. When other participants go READY, SLA resumes. No special handling needed. |
| DR-005 | Round Robin availability cache                 | Risk       | Member status is cached in Redis with TTL; deactivation may not immediately propagate to auto-pull engine. | `isActive` check MUST read from Auth record (source of truth), not from Redis cache. Auto-pull engine queries auth-service for active status.           |
| DR-006 | Mobile self-deactivation on uninstall          | Risk       | Malicious actor could call deactivate endpoint repeatedly for the same user.                               | Rate limiting on the endpoint; idempotent behavior mitigates repeated calls.                                                                            |

---

## **13 | Success Metrics**

| Metric                            | Target  | Time Window         | Data Source         |
| --------------------------------- | ------- | ------------------- | ------------------- |
| Toggle action success rate        | 99%     | 30 days post launch | API logs            |
| Deactivated user login rejection  | 100%    | 30 days post launch | Auth logs           |
| Toggle action response time (p95) | < 500ms | 30 days post launch | API gateway metrics |

---

## **14 | Future Considerations**

| Topic                                                     | Why it matters later                                                 |
| --------------------------------------------------------- | -------------------------------------------------------------------- |
| Bulk deactivate/reactivate                                | Reduces Admin effort during team restructuring.                      |
| Scheduled deactivation (e.g., based on contract end date) | Automates offboarding without manual Admin action.                   |
| Deactivation reason / notes field                         | Provides context for why a member was deactivated.                   |
| Deactivation activity log in UI                           | Enables Admins to see who deactivated/reactivated a member and when. |

---

## **15 | Limitations**

| Limitation                                                  | Impact                                            |
| ----------------------------------------------------------- | ------------------------------------------------- |
| No bulk toggle.                                             | Admin must toggle one member at a time.           |
| No deactivation reason.                                     | Admin cannot record why a member was deactivated. |
| No schedule or auto-deactivation.                           | Admin must manually deactivate members.           |
| No distinction between temporary vs permanent deactivation. | All deactivations are treated equally.            |

---

## **16 | Appendix — Test Scenarios**

### 16.1 API Integration Tests (BE)

| TC ID  | Scenario                                | Steps                                                                                            | Expected Result                                                           |
| ------ | --------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| TC-001 | Deactivate active member                | 1. Admin calls `PATCH /auth/member/:id/toggle-active-status` with `{ "isActive": false }`.       | Auth record `isActive` set to `false`. All sessions deleted. Returns 200. |
| TC-002 | Reactivate deactivated member           | 1. Admin calls same endpoint with `{ "isActive": true }` for a deactivated user.                 | Auth record `isActive` set to `true`. Returns 200.                        |
| TC-003 | Toggle to same state (idempotent)       | 1. Admin calls toggle with `isActive: false` for an already-deactivated user.                    | Returns 200. No duplicate session deletion.                               |
| TC-004 | Toggle non-existent user                | 1. Admin calls toggle with invalid `userId`.                                                     | Returns 404.                                                              |
| TC-005 | Unauthenticated request                 | 1. Request without JWT token.                                                                    | Returns 401.                                                              |
| TC-006 | Unauthorized request (no permission)    | 1. Request from user without `member:update` permission.                                         | Returns 403.                                                              |
| TC-007 | Deactivated user tries to login         | 1. Deactivate user. 2. User attempts login with correct credentials.                             | Login returns error "Akun dinonaktifkan. Silakan hubungi Admin.".         |
| TC-008 | Reactivated user tries to login         | 1. Reactivate user. 2. User attempts login with correct credentials.                             | Login succeeds, new session created.                                      |
| TC-009 | Deactivated user tries to refresh token | 1. Deactivate user while they have a refresh token. 2. User attempts to refresh.                 | Refresh returns unauthorized.                                             |
| TC-010 | Force logout during deactivation        | 1. User has active session. 2. Admin deactivates user. 3. User makes API request with old token. | Request returns 401. Frontend shows session invalidation toast.           |

### 16.2 AUX & Round Robin Tests (BE)

| TC ID  | Scenario                                            | Steps                                                                                                                                                                       | Expected Result                                                                         |
| ------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| TC-011 | Deactivate member with open AUX interval            | 1. Set member status to AWAY (creates open AUX interval). 2. Admin deactivates member. 3. Check `agentauxintervals` collection.                                             | Open AUX interval is NOT closed. `endAt` remains `null`.                                |
| TC-012 | AUX analytics after deactivation                    | 1. Member has historical closed AUX intervals. 2. Admin deactivates member. 3. Query AUX summary via `getAuxSummary()`.                                                     | Historical AUX data is still returned correctly.                                        |
| TC-013 | Round Robin excludes deactivated member             | 1. Create team with 2 agents (Agent A active, Agent B deactivated). 2. Agent A is AWAY, Agent B is READY. 3. Trigger auto-pull for an unassigned conversation in that team. | Conversation is NOT assigned to Agent B (deactivated). Conversation remains unassigned. |
| TC-014 | Reactivated member becomes eligible for Round Robin | 1. Reactivate Agent B from TC-013. 2. Set Agent B to READY. 3. Trigger auto-pull again.                                                                                     | Conversation is assigned to Agent B (now active + READY).                               |
| TC-015 | Conversation remains assigned after deactivation    | 1. Member has 3 active assigned conversations. 2. Admin deactivates member. 3. Check participant list on each conversation.                                                 | Member is still listed as a participant on all 3 conversations.                         |
| TC-016 | Deactivation respects `maxConversation`             | 1. Member is at `maxConversation = 3` with 3 active conversations. 2. Admin deactivates member. 3. Check member's `maxConversation` field.                                  | `maxConversation` is NOT changed. Conversations remain assigned.                        |

### 16.3 Member Visibility Tests (BE)

| TC ID  | Scenario                                     | Steps                                                                                                                                                                                             | Expected Result                                                             |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| TC-017 | Member list shows deactivated members        | 1. Admin has member A (active) and member B (deactivated via auth.isActive=false, member.isActive still true). 2. Admin opens member settings page. 3. GET /member called without isActive param. | Both member A (Aktif) and member B (Nonaktif) are returned in the response. |
| TC-018 | Member list hides soft-deleted members       | 1. Admin has member C (soft-deleted, member.isDeleted=true). 2. GET /member called without isActive param.                                                                                        | Member C is NOT returned. Only non-deleted members appear.                  |
| TC-019 | Assignable member list excludes deactivated  | 1. Admin calls GET /member with isActive=true for ticket assignable list. 2. Member A (active) and member B (deactivated) exist.                                                                  | Only member A is returned. Member B is excluded.                            |
| TC-020 | findMembersByIds returns deactivated members | 1. Fetch member B by ID using findMembersByIds. 2. Member B is deactivated but not soft-deleted.                                                                                                  | Member B is returned. findMembersByIds MUST NOT filter by isActive.         |
| TC-021 | Search shows deactivated members in settings | 1. Admin searches "B" in member settings page (no isActive filter). 2. Member B (deactivated, name contains "B") exists.                                                                          | Member B appears in search results with "Nonaktif" badge.                   |
| TC-022 | Search excludes deactivated in assignment    | 1. Admin searches "B" in ticket assignee dropdown (isActive=true). 2. Member B (deactivated, name contains "B") exists.                                                                           | Member B does NOT appear in search results.                                 |

### 16.4 FE Component Tests

| TC ID  | Scenario                                   | Steps                                                                        | Expected Result                                                                                                             |
| ------ | ------------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| TC-023 | Status badge shows correct state           | 1. Member list loads with active and deactivated members.                    | Active members show "Aktif" (green). Deactivated members show "Nonaktif" (gray/red).                                        |
| TC-024 | Row menu shows correct toggle label        | 1. Open row menu for active member. 2. Open row menu for deactivated member. | Active: shows "Nonaktifkan anggota". Deactivated: shows "Aktifkan anggota".                                                 |
| TC-025 | Confirmation modal appears                 | 1. Click toggle action in row menu.                                          | Modal appears with title and description in Bahasa Indonesia.                                                               |
| TC-026 | Successful toggle refreshes list           | 1. Confirm toggle in modal. 2. API returns success.                          | Toast shown. Table row updates to reflect new status. List refetched.                                                       |
| TC-027 | Failed toggle shows error toast            | 1. Confirm toggle. 2. API returns error.                                     | Error toast shown. Modal closes. Table row unchanged.                                                                       |
| TC-028 | Deactivation modal shows preservation note | 1. Click "Nonaktifkan anggota" for an active member.                         | Confirmation modal includes text "Anggota tetap terdaftar di tim dan percakapan yang sedang berlangsung tidak terpengaruh." |

### 16.5 Security & Mobile Tests

| TC ID  | Scenario                                      | Steps                                                                                                | Expected Result                                                    |
| ------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| TC-029 | Toggle yourself                               | 1. Admin attempts to deactivate their own account.                                                   | Action succeeds (no self-block guard). Admin is force-logged out.  |
| TC-030 | Deactivate last active Admin                  | 1. Only one active Admin exists. 2. Deactivate that Admin.                                           | Action succeeds (unlike soft delete). Workspace may have no Admin. |
| TC-031 | Concurrent toggle requests                    | 1. Two Admins simultaneously toggle the same member.                                                 | Both requests succeed. Last write wins. No data corruption.        |
| TC-032 | Mobile app self-deactivation on uninstall     | 1. Mobile app sends deactivate request with user's own JWT for that same user.                       | Member deactivated. Sessions deleted. Returns success.             |
| TC-033 | Mobile app deactivation with invalid token    | 1. Mobile app sends deactivate request with expired/invalid JWT.                                     | Returns 401. No state change.                                      |
| TC-034 | Mobile app re-registration after deactivation | 1. Mobile user is deactivated. 2. Admin reactivates user via Admin UI. 3. Mobile user logs in again. | Login succeeds. New session created. Mobile app functional again.  |
