# Test Framework: Activate / Deactivate Member

Source: `PRD/Auth/PRD Setting - activate-deactivate-member.md`

---

## TEST GROUP: ACT-AUTH — Auth Service & API Gateway

### ACT-AUTH-001: Deactivate active member

Prerequisites: Admin role with `member:update` permission. Target member is active (`isActive = true`) with at least one active session.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Login as Admin | Dashboard loaded |
| 2 | Call `PATCH /auth/member/:id/toggle-active-status` with `{ "isActive": false }` | HTTP 200 returned |
| 3 | Verify DB: Auth record `isActive` field | `isActive = false` |
| 4 | Verify DB: session collection for that userId | All sessions deleted |
| 5 | Verify DB: session invalidation reason | `MEMBER_DEACTIVATED` set |

### ACT-AUTH-002: Reactivate deactivated member

Prerequisites: Admin role with `member:update` permission. Target member is deactivated (`isActive = false`).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Call `PATCH /auth/member/:id/toggle-active-status` with `{ "isActive": true }` | HTTP 200 returned |
| 2 | Verify DB: Auth record `isActive` field | `isActive = true` |
| 3 | Verify DB: session collection for that userId | No sessions deleted (no side effect on reactivation) |

### ACT-AUTH-003: Toggle to same state — idempotent

Prerequisites: Admin role. Target member is already deactivated.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Call toggle endpoint with `{ "isActive": false }` for already-deactivated member | HTTP 200 returned |
| 2 | Verify DB: Auth record unchanged | `isActive` remains `false` |
| 3 | Verify no duplicate session deletion triggered | Session service called 0 times |

### ACT-AUTH-004: Toggle non-existent user

Prerequisites: Admin role. Use an invalid or non-existent `userId`.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Call toggle endpoint with invalid `userId` | HTTP 404 returned |
| 2 | Verify response body | `{ "message": "Anggota tidak ditemukan" }` |
| 3 | Verify no DB changes | Auth collection unchanged |

### ACT-AUTH-005: Unauthenticated request

Prerequisites: No JWT token in request header.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Call toggle endpoint without `Authorization` header | HTTP 401 returned |
| 2 | Verify no DB changes | Auth collection unchanged |

### ACT-AUTH-006: Unauthorized request — missing permission

Prerequisites: User authenticated but does NOT have `member:update` permission.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Login as non-Admin user | Authenticated |
| 2 | Call toggle endpoint | HTTP 403 returned |
| 3 | Verify no DB changes | Auth collection unchanged |

### ACT-AUTH-007: Deactivated user tries to login

Prerequisites: Member is deactivated (`isActive = false`). Member has valid credentials.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Attempt login with correct credentials | Login rejected |
| 2 | Verify response | Error message "Akun dinonaktifkan. Silakan hubungi Admin." |
| 3 | Verify no session created | Session collection unchanged |

### ACT-AUTH-008: Reactivated user tries to login

Prerequisites: Member was deactivated and has just been reactivated.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Attempt login with correct credentials | Login succeeds |
| 2 | Verify DB: new session created | Session record exists with new token |

### ACT-AUTH-009: Deactivated user tries to refresh token

Prerequisites: Member has a valid refresh token. Member is then deactivated.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Deactivate the member | HTTP 200, member deactivated |
| 2 | Use old refresh token to refresh session | HTTP 401 returned |
| 3 | Verify response | "Akun dinonaktifkan" error |

### ACT-AUTH-010: Force logout — old token rejected after deactivation

Prerequisites: Member has an active session token. Admin deactivates the member.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Member makes API request with old token before deactivation | Request succeeds |
| 2 | Admin calls toggle endpoint to deactivate | HTTP 200, sessions deleted |
| 3 | Member makes any API request with same old token | HTTP 401 returned |
| 4 | Verify FE behaviour | Session invalidation toast "Sesi Anda telah berakhir karena akun Anda dinonaktifkan." shown |

---

## TEST GROUP: ACT-AUX — AUX & Round Robin

### ACT-AUX-001: Deactivate member with open AUX interval

Prerequisites: Member status is AWAY (open AUX interval exists in `agentauxintervals` collection with `endAt = null`).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Admin deactivates the member | HTTP 200 |
| 2 | Verify DB: `agentauxintervals` for that member | Open interval NOT closed — `endAt` remains `null` |
| 3 | Verify no status transition event emitted | No AWAY→LOGOUT event in logs |

### ACT-AUX-002: Historical AUX data preserved after deactivation

Prerequisites: Member has closed historical AUX intervals. Member is then deactivated.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Admin deactivates the member | HTTP 200 |
| 2 | Query AUX summary via `getAuxSummary()` for that member | Historical AUX data returned correctly |
| 3 | Verify analytics figures unchanged | No data distortion |

### ACT-AUX-003: Round Robin excludes deactivated member

Prerequisites: Team with 2 agents — Agent A (active, AWAY) and Agent B (deactivated, READY in cache). Unassigned conversation exists in that team.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Trigger auto-pull (`autoPullConversation`) | Auto-pull executes |
| 2 | Verify `isMemberAvailableForAutoPull()` for Agent B | Returns `false` (deactivated takes precedence over READY status) |
| 3 | Verify conversation assignment | Conversation NOT assigned to Agent B |
| 4 | Verify conversation state | Remains unassigned (Agent A is AWAY, Agent B excluded) |

### ACT-AUX-004: Reactivated member becomes eligible for Round Robin

Prerequisites: Continue from ACT-AUX-003. Agent B has been reactivated and set to READY.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Admin reactivates Agent B | HTTP 200 |
| 2 | Agent B sets status to READY | Status updated |
| 3 | Trigger auto-pull again | Auto-pull executes |
| 4 | Verify Agent B eligibility | `isMemberAvailableForAutoPull()` returns `true` |
| 5 | Verify conversation assignment | Conversation assigned to Agent B |

### ACT-AUX-005: Conversations remain assigned after deactivation

Prerequisites: Member has 3 active assigned conversations.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Admin deactivates the member | HTTP 200 |
| 2 | Check participant list on each of the 3 conversations | Member still listed as participant on all 3 |
| 3 | Verify no unassignment event fired | Conversation assignee field unchanged |

### ACT-AUX-006: maxConversation not affected by deactivation

Prerequisites: Member is at `maxConversation = 3` with 3 active assigned conversations.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Admin deactivates the member | HTTP 200 |
| 2 | Check member's `maxConversation` field | Value unchanged |
| 3 | Check conversation assignment | All 3 conversations remain assigned to the member |

---

## TEST GROUP: ACT-VIS — Member Visibility

### ACT-VIS-001: Member list shows deactivated members

Prerequisites: Member A is active (`auth.isActive=true`, `member.isActive=true`). Member B is deactivated (`auth.isActive=false`, `member.isActive=true`).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Admin opens member settings page | Page loads |
| 2 | Verify API call: `GET /member` (no `isActive` param) | Both Member A and Member B returned |
| 3 | Verify Member A badge | "Aktif" badge shown |
| 4 | Verify Member B badge | "Nonaktif" badge shown |

### ACT-VIS-002: Member list hides soft-deleted members

Prerequisites: Member C is soft-deleted (`member.isDeleted=true`).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Admin calls `GET /member` without `isActive` param | Response returned |
| 2 | Verify Member C in response | Member C NOT returned |
| 3 | Verify only non-deleted members appear | Correct filtering by `isDeleted: { $ne: true }` |

### ACT-VIS-003: Assignable member list excludes deactivated

Prerequisites: Member A (active), Member B (deactivated). Context: ticket assignee dropdown.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Call `GET /member?isActive=true` (ticket assignable context) | Response returned |
| 2 | Verify Member A in response | Included |
| 3 | Verify Member B in response | NOT included |

### ACT-VIS-004: findMembersByIds returns deactivated members

Prerequisites: Member B is deactivated but NOT soft-deleted.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Call `findMembersByIds` with Member B's ID | Response returned |
| 2 | Verify Member B in response | Returned (not filtered by `isActive`) |
| 3 | Verify filtering applied | Only `isDeleted: { $ne: true }` applied — no `isActive` filter |

### ACT-VIS-005: Search shows deactivated members in settings page

Prerequisites: Member B is deactivated, name contains "B". Admin searches from member settings page.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Admin types "B" in search field on member settings page | Search fires without `isActive` filter |
| 2 | Verify Member B in results | Member B appears |
| 3 | Verify Member B badge | "Nonaktif" badge shown |

### ACT-VIS-006: Search excludes deactivated in assignment context

Prerequisites: Member B is deactivated, name contains "B". User searches in ticket assignee dropdown.

| Step | Action | Expected |
|------|--------|----------|
| 1 | User types "B" in ticket assignee search | Search fires with `isActive=true` filter |
| 2 | Verify Member B in results | Member B NOT returned |

---

## TEST GROUP: ACT-FE — Frontend Components

### ACT-FE-001: Status badge shows correct state

Prerequisites: Member list loaded with at least one active and one deactivated member.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open member settings page | Member list renders |
| 2 | Verify active member row | "Aktif" badge shown in green |
| 3 | Verify deactivated member row | "Nonaktif" badge shown in gray/red |

### ACT-FE-002: Row menu shows correct toggle label

Prerequisites: Member list loaded with one active and one deactivated member.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open row menu (three dots) for active member | Menu opens |
| 2 | Verify toggle option label | "Nonaktifkan anggota" shown |
| 3 | Open row menu for deactivated member | Menu opens |
| 4 | Verify toggle option label | "Aktifkan anggota" shown |

### ACT-FE-003: Confirmation modal appears on toggle click

Prerequisites: Admin is on member settings page.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click "Nonaktifkan anggota" from row menu | Confirmation modal opens |
| 2 | Verify modal title | "Nonaktifkan anggota" |
| 3 | Verify modal description in Bahasa Indonesia | Description text present |
| 4 | Verify deactivation note | "Anggota tetap terdaftar di tim dan percakapan yang sedang berlangsung tidak terpengaruh." shown |
| 5 | Click cancel | Modal closes, no action taken |

### ACT-FE-004: Successful toggle refreshes list

Prerequisites: Admin confirms toggle in modal.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click "Nonaktifkan anggota" and confirm in modal | API called |
| 2 | Verify API response | HTTP 200 |
| 3 | Verify toast notification | "Anggota berhasil dinonaktifkan" shown |
| 4 | Verify table row | Badge updated to "Nonaktif" |
| 5 | Verify list refetched | Updated data reflected without page reload |

### ACT-FE-005: Failed toggle shows error toast

Prerequisites: API returns error (e.g., network failure or 500).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click toggle and confirm in modal | API called |
| 2 | Simulate API error | 500 or network failure |
| 3 | Verify error toast | "Gagal memperbarui status anggota. Silakan coba lagi." shown |
| 4 | Verify modal state | Modal closes |
| 5 | Verify table row | Badge unchanged (still original state) |

### ACT-FE-006: Reactivation modal shows correct description

Prerequisites: Admin opens row menu for deactivated member.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click "Aktifkan anggota" | Confirmation modal opens |
| 2 | Verify modal title | "Aktifkan anggota" |
| 3 | Verify modal description | "Anggota akan dapat masuk kembali setelah diaktifkan." shown |
| 4 | Confirm action | Toast "Anggota berhasil diaktifkan" shown. Badge updated to "Aktif". |

---

## TEST GROUP: ACT-SEC — Security & Mobile

### ACT-SEC-001: Admin deactivates their own account

Prerequisites: Admin is logged in. Admin attempts to deactivate themselves.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Admin calls toggle endpoint with their own `userId`, `{ "isActive": false }` | HTTP 200 returned |
| 2 | Verify DB: Admin's Auth `isActive` | Set to `false` |
| 3 | Verify Admin's sessions | All sessions deleted |
| 4 | Verify Admin's next request | Returns 401 (force-logged out) |

### ACT-SEC-002: Deactivate last active Admin

Prerequisites: Only one active Admin in the workspace.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Deactivate the last active Admin | HTTP 200 returned (no guard blocks this) |
| 2 | Verify Auth record | `isActive = false` |
| 3 | Verify workspace state | No active Admin remains (workspace may be locked) |

### ACT-SEC-003: Concurrent toggle from two Admins

Prerequisites: Two Admin users. Same target member.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Admin A and Admin B simultaneously call toggle on same member | Both requests processed |
| 2 | Verify both responses | Both return HTTP 200 |
| 3 | Verify DB final state | Last write wins — `isActive` reflects last request |
| 4 | Verify data integrity | No corruption, no partial state |

### ACT-SEC-004: Mobile app self-deactivation on uninstall

Prerequisites: Mobile user is logged in with valid JWT. Mobile app sends deactivation request using the user's own token.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Mobile app calls `PATCH /auth/member/:id/toggle-active-status` with own JWT, `{ "isActive": false }` | HTTP 200 returned |
| 2 | Verify DB: `isActive = false` | Deactivation confirmed |
| 3 | Verify sessions | All sessions deleted |
| 4 | Verify mobile app subsequent request | Returns 401 (no further authenticated calls possible) |

### ACT-SEC-005: Mobile app deactivation with invalid/expired token

Prerequisites: Mobile app has expired or invalid JWT.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Mobile app calls toggle endpoint with invalid token | HTTP 401 returned |
| 2 | Verify DB | No state change |

### ACT-SEC-006: Mobile app deactivation for non-existent user

Prerequisites: Mobile app calls deactivation with a non-existent or invalid `userId`.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Call toggle endpoint with invalid `userId` | HTTP 404 returned |
| 2 | Verify response | No state change |

### ACT-SEC-007: Mobile app re-registration after deactivation

Prerequisites: Mobile user was deactivated. Admin has reactivated the user.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Mobile user attempts login from new device | Login succeeds |
| 2 | Verify DB: new session created | Session record exists |
| 3 | Verify mobile app state | Fully functional again |

---

## REGRESSION TEST SCOPE

These tests verify existing behaviors are NOT broken by this feature:

| ID | Existing Behavior | Test |
|----|------------------|------|
| REG-001 | Soft-deleted members not visible in member list | Member with `isDeleted=true` → not returned from `GET /member` |
| REG-002 | Login with valid credentials succeeds for active member | Active member login → session created |
| REG-003 | Token refresh works for active member | Active member refresh token → new access token issued |
| REG-004 | Round Robin assigns to available active agent | Active READY agent → receives auto-pull conversation |
| REG-005 | Member settings page loads correctly | Page renders member table without error |
| REG-006 | Ticket assignee dropdown shows active members | `GET /member?isActive=true` → only active members returned |
| REG-007 | Conversation assignee dropdown shows active members | Assignee search → deactivated members excluded |

---

## TEST DATA REQUIREMENTS SUMMARY

| Entity | Minimum Data Needed |
|--------|-------------------|
| Workspace | 1 workspace with at least 1 active Team Inbox |
| Users | Admin (with `member:update`), Agent (active), Agent (to be deactivated), non-Admin user (without permission) |
| Auth records | Members with valid credentials, at least 1 with active session |
| Sessions | At least 1 active session for deactivation test |
| AUX intervals | 1 open AUX interval (AWAY state) for ACT-AUX-001 |
| Conversations | 3+ conversations assigned to deactivation target for ACT-AUX-005 |
| Team Inbox | 1 team with 2 agents (1 active AWAY, 1 to be deactivated READY) for Round Robin tests |
