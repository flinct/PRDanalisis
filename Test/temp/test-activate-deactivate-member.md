# Test Framework: Activate / Deactivate Member

Source: `PRD/Auth/PRD Setting - activate-deactivate-member.md`

Total test cases: **35**

| ENV | Passed | Failed | On Test | Need to Test |
|:----|-------:|-------:|--------:|-------------:|
| DEV | 0 | 0 | 0 | 35 |
| Staging | 0 | 0 | 0 | 35 |
| Prod | 0 | 0 | 0 | 35 |

---

## TEST GROUP: ACT-AUTH — Auth Service & API Gateway

### ACT-AUTH-001 · Deactivate active member

| | |
|:--|:--|
| **Pre-Condition** | Admin role with `member:update` permission. Target member is active (`isActive = true`) with at least one active session. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Login as Admin
2. Call `PATCH /auth/member/:id/toggle-active-status` with `{ "isActive": false }`
3. Verify DB: Auth record `isActive` field
4. Verify DB: session collection for that userId
5. Verify DB: session invalidation reason

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Dashboard loaded | | Need to Test | | Need to Test |
| HTTP 200 returned | | Need to Test | | Need to Test |
| `isActive = false` | | Need to Test | | Need to Test |
| All sessions deleted | | Need to Test | | Need to Test |
| `MEMBER_DEACTIVATED` set | | Need to Test | | Need to Test |

---

### ACT-AUTH-002 · Reactivate deactivated member

| | |
|:--|:--|
| **Pre-Condition** | Admin role with `member:update` permission. Target member is deactivated (`isActive = false`). |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Call `PATCH /auth/member/:id/toggle-active-status` with `{ "isActive": true }`
2. Verify DB: Auth record `isActive` field
3. Verify DB: session collection for that userId

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 200 returned | | Need to Test | | Need to Test |
| `isActive = true` | | Need to Test | | Need to Test |
| No sessions deleted (no side effect on reactivation) | | Need to Test | | Need to Test |

---

### ACT-AUTH-003 · Toggle to same state — idempotent

| | |
|:--|:--|
| **Pre-Condition** | Admin role. Target member is already deactivated. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Call toggle endpoint with `{ "isActive": false }` for already-deactivated member
2. Verify DB: Auth record unchanged
3. Verify no duplicate session deletion triggered

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 200 returned | | Need to Test | | Need to Test |
| `isActive` remains `false` | | Need to Test | | Need to Test |
| Session service called 0 times | | Need to Test | | Need to Test |

---

### ACT-AUTH-004 · Toggle non-existent user

| | |
|:--|:--|
| **Pre-Condition** | Admin role. Use an invalid or non-existent `userId`. |
| **Test Type** | NEGATIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Call toggle endpoint with invalid `userId`
2. Verify response body
3. Verify no DB changes

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 404 returned | | Need to Test | | Need to Test |
| `{ "message": "Anggota tidak ditemukan" }` | | Need to Test | | Need to Test |
| Auth collection unchanged | | Need to Test | | Need to Test |

---

### ACT-AUTH-005 · Unauthenticated request

| | |
|:--|:--|
| **Pre-Condition** | No JWT token in request header. |
| **Test Type** | NEGATIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Call toggle endpoint without `Authorization` header
2. Verify no DB changes

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 401 returned | | Need to Test | | Need to Test |
| Auth collection unchanged | | Need to Test | | Need to Test |

---

### ACT-AUTH-006 · Unauthorized request — missing permission

| | |
|:--|:--|
| **Pre-Condition** | User authenticated but does NOT have `member:update` permission. |
| **Test Type** | NEGATIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Login as non-Admin user
2. Call toggle endpoint
3. Verify no DB changes

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Authenticated | | Need to Test | | Need to Test |
| HTTP 403 returned | | Need to Test | | Need to Test |
| Auth collection unchanged | | Need to Test | | Need to Test |

---

### ACT-AUTH-007 · Deactivated user tries to login

| | |
|:--|:--|
| **Pre-Condition** | Member is deactivated (`isActive = false`). Member has valid credentials. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Attempt login with correct credentials
2. Verify response
3. Verify no session created

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Login rejected | | Need to Test | | Need to Test |
| Error message "Akun dinonaktifkan. Silakan hubungi Admin." | | Need to Test | | Need to Test |
| Session collection unchanged | | Need to Test | | Need to Test |

---

### ACT-AUTH-008 · Reactivated user tries to login

| | |
|:--|:--|
| **Pre-Condition** | Member was deactivated and has just been reactivated. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Attempt login with correct credentials
2. Verify DB: new session created

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Login succeeds | | Need to Test | | Need to Test |
| Session record exists with new token | | Need to Test | | Need to Test |

---

### ACT-AUTH-009 · Deactivated user tries to refresh token

| | |
|:--|:--|
| **Pre-Condition** | Member has a valid refresh token. Member is then deactivated. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Deactivate the member
2. Use old refresh token to refresh session
3. Verify response

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 200, member deactivated | | Need to Test | | Need to Test |
| HTTP 401 returned | | Need to Test | | Need to Test |
| "Akun dinonaktifkan" error | | Need to Test | | Need to Test |

---

### ACT-AUTH-010 · Force logout — old token rejected after deactivation

| | |
|:--|:--|
| **Pre-Condition** | Member has an active session token. Admin deactivates the member. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Member makes API request with old token before deactivation
2. Admin calls toggle endpoint to deactivate
3. Member makes any API request with same old token
4. Verify FE behaviour

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Request succeeds | | Need to Test | | Need to Test |
| HTTP 200, sessions deleted | | Need to Test | | Need to Test |
| HTTP 401 returned | | Need to Test | | Need to Test |
| Session invalidation toast "Sesi Anda telah berakhir karena akun Anda dinonaktifkan." shown | | Need to Test | | Need to Test |

---

## TEST GROUP: ACT-AUX — AUX & Round Robin

### ACT-AUX-001 · Deactivate member with open AUX interval

| | |
|:--|:--|
| **Pre-Condition** | Member status is AWAY (open AUX interval exists in `agentauxintervals` collection with `endAt = null`). |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Admin deactivates the member
2. Verify DB: `agentauxintervals` for that member
3. Verify no status transition event emitted

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 200 | | Need to Test | | Need to Test |
| Open interval NOT closed — `endAt` remains `null` | | Need to Test | | Need to Test |
| No AWAY→LOGOUT event in logs | | Need to Test | | Need to Test |

---

### ACT-AUX-002 · Historical AUX data preserved after deactivation

| | |
|:--|:--|
| **Pre-Condition** | Member has closed historical AUX intervals. Member is then deactivated. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Admin deactivates the member
2. Query AUX summary via `getAuxSummary()` for that member
3. Verify analytics figures unchanged

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 200 | | Need to Test | | Need to Test |
| Historical AUX data returned correctly | | Need to Test | | Need to Test |
| No data distortion | | Need to Test | | Need to Test |

---

### ACT-AUX-003 · Round Robin excludes deactivated member

| | |
|:--|:--|
| **Pre-Condition** | Team with 2 agents — Agent A (active, AWAY) and Agent B (deactivated, READY in cache). Unassigned conversation exists in that team. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Trigger auto-pull (`autoPullConversation`)
2. Verify `isMemberAvailableForAutoPull()` for Agent B
3. Verify conversation assignment
4. Verify conversation state

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Auto-pull executes | | Need to Test | | Need to Test |
| Returns `false` (deactivated takes precedence over READY status) | | Need to Test | | Need to Test |
| Conversation NOT assigned to Agent B | | Need to Test | | Need to Test |
| Remains unassigned (Agent A is AWAY, Agent B excluded) | | Need to Test | | Need to Test |

---

### ACT-AUX-004 · Reactivated member becomes eligible for Round Robin

| | |
|:--|:--|
| **Pre-Condition** | Continue from ACT-AUX-003. Agent B has been reactivated and set to READY. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Admin reactivates Agent B
2. Agent B sets status to READY
3. Trigger auto-pull again
4. Verify Agent B eligibility
5. Verify conversation assignment

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 200 | | Need to Test | | Need to Test |
| Status updated | | Need to Test | | Need to Test |
| Auto-pull executes | | Need to Test | | Need to Test |
| `isMemberAvailableForAutoPull()` returns `true` | | Need to Test | | Need to Test |
| Conversation assigned to Agent B | | Need to Test | | Need to Test |

---

### ACT-AUX-005 · Conversations remain assigned after deactivation

| | |
|:--|:--|
| **Pre-Condition** | Member has 3 active assigned conversations. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Admin deactivates the member
2. Check participant list on each of the 3 conversations
3. Verify no unassignment event fired

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 200 | | Need to Test | | Need to Test |
| Member still listed as participant on all 3 | | Need to Test | | Need to Test |
| Conversation assignee field unchanged | | Need to Test | | Need to Test |

---

### ACT-AUX-006 · maxConversation not affected by deactivation

| | |
|:--|:--|
| **Pre-Condition** | Member is at `maxConversation = 3` with 3 active assigned conversations. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Admin deactivates the member
2. Check member's `maxConversation` field
3. Check conversation assignment

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 200 | | Need to Test | | Need to Test |
| Value unchanged | | Need to Test | | Need to Test |
| All 3 conversations remain assigned to the member | | Need to Test | | Need to Test |

---

## TEST GROUP: ACT-VIS — Member Visibility

### ACT-VIS-001 · Member list shows deactivated members

| | |
|:--|:--|
| **Pre-Condition** | Member A is active (`auth.isActive=true`, `member.isActive=true`). Member B is deactivated (`auth.isActive=false`, `member.isActive=true`). |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Admin opens member settings page
2. Verify API call: `GET /member` (no `isActive` param)
3. Verify Member A badge
4. Verify Member B badge

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Page loads | | Need to Test | | Need to Test |
| Both Member A and Member B returned | | Need to Test | | Need to Test |
| "Aktif" badge shown | | Need to Test | | Need to Test |
| "Nonaktif" badge shown | | Need to Test | | Need to Test |

---

### ACT-VIS-002 · Member list hides soft-deleted members

| | |
|:--|:--|
| **Pre-Condition** | Member C is soft-deleted (`member.isDeleted=true`). |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Admin calls `GET /member` without `isActive` param
2. Verify Member C in response
3. Verify only non-deleted members appear

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Response returned | | Need to Test | | Need to Test |
| Member C NOT returned | | Need to Test | | Need to Test |
| Correct filtering by `isDeleted: { $ne: true }` | | Need to Test | | Need to Test |

---

### ACT-VIS-003 · Assignable member list excludes deactivated

| | |
|:--|:--|
| **Pre-Condition** | Member A (active), Member B (deactivated). Context: ticket assignee dropdown. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Call `GET /member?isActive=true` (ticket assignable context)
2. Verify Member A in response
3. Verify Member B in response

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Response returned | | Need to Test | | Need to Test |
| Included | | Need to Test | | Need to Test |
| NOT included | | Need to Test | | Need to Test |

---

### ACT-VIS-004 · findMembersByIds returns deactivated members

| | |
|:--|:--|
| **Pre-Condition** | Member B is deactivated but NOT soft-deleted. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Call `findMembersByIds` with Member B's ID
2. Verify Member B in response
3. Verify filtering applied

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Response returned | | Need to Test | | Need to Test |
| Returned (not filtered by `isActive`) | | Need to Test | | Need to Test |
| Only `isDeleted: { $ne: true }` applied — no `isActive` filter | | Need to Test | | Need to Test |

---

### ACT-VIS-005 · Search shows deactivated members in settings page

| | |
|:--|:--|
| **Pre-Condition** | Member B is deactivated, name contains "B". Admin searches from member settings page. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Admin types "B" in search field on member settings page
2. Verify Member B in results
3. Verify Member B badge

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Search fires without `isActive` filter | | Need to Test | | Need to Test |
| Member B appears | | Need to Test | | Need to Test |
| "Nonaktif" badge shown | | Need to Test | | Need to Test |

---

### ACT-VIS-006 · Search excludes deactivated in assignment context

| | |
|:--|:--|
| **Pre-Condition** | Member B is deactivated, name contains "B". User searches in ticket assignee dropdown. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. User types "B" in ticket assignee search
2. Verify Member B in results

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Search fires with `isActive=true` filter | | Need to Test | | Need to Test |
| Member B NOT returned | | Need to Test | | Need to Test |

---

## TEST GROUP: ACT-FE — Frontend Components

### ACT-FE-001 · Status badge shows correct state

| | |
|:--|:--|
| **Pre-Condition** | Member list loaded with at least one active and one deactivated member. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open member settings page
2. Verify active member row
3. Verify deactivated member row

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Member list renders | | Need to Test | | Need to Test |
| "Aktif" badge shown in green | | Need to Test | | Need to Test |
| "Nonaktif" badge shown in gray/red | | Need to Test | | Need to Test |

---

### ACT-FE-002 · Row menu shows correct toggle label

| | |
|:--|:--|
| **Pre-Condition** | Member list loaded with one active and one deactivated member. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open row menu (three dots) for active member
2. Verify toggle option label
3. Open row menu for deactivated member
4. Verify toggle option label

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Menu opens | | Need to Test | | Need to Test |
| "Nonaktifkan anggota" shown | | Need to Test | | Need to Test |
| Menu opens | | Need to Test | | Need to Test |
| "Aktifkan anggota" shown | | Need to Test | | Need to Test |

---

### ACT-FE-003 · Confirmation modal appears on toggle click

| | |
|:--|:--|
| **Pre-Condition** | Admin is on member settings page. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Click "Nonaktifkan anggota" from row menu
2. Verify modal title
3. Verify modal description in Bahasa Indonesia
4. Verify deactivation note
5. Click cancel

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Confirmation modal opens | | Need to Test | | Need to Test |
| "Nonaktifkan anggota" | | Need to Test | | Need to Test |
| Description text present | | Need to Test | | Need to Test |
| "Anggota tetap terdaftar di tim dan percakapan yang sedang berlangsung tidak terpengaruh." shown | | Need to Test | | Need to Test |
| Modal closes, no action taken | | Need to Test | | Need to Test |

---

### ACT-FE-004 · Successful toggle refreshes list

| | |
|:--|:--|
| **Pre-Condition** | Admin confirms toggle in modal. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Click "Nonaktifkan anggota" and confirm in modal
2. Verify API response
3. Verify toast notification
4. Verify table row
5. Verify list refetched

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| API called | | Need to Test | | Need to Test |
| HTTP 200 | | Need to Test | | Need to Test |
| "Anggota berhasil dinonaktifkan" shown | | Need to Test | | Need to Test |
| Badge updated to "Nonaktif" | | Need to Test | | Need to Test |
| Updated data reflected without page reload | | Need to Test | | Need to Test |

---

### ACT-FE-005 · Failed toggle shows error toast

| | |
|:--|:--|
| **Pre-Condition** | API returns error (e.g., network failure or 500). |
| **Test Type** | NEGATIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Click toggle and confirm in modal
2. Simulate API error
3. Verify error toast
4. Verify modal state
5. Verify table row

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| API called | | Need to Test | | Need to Test |
| 500 or network failure | | Need to Test | | Need to Test |
| "Gagal memperbarui status anggota. Silakan coba lagi." shown | | Need to Test | | Need to Test |
| Modal closes | | Need to Test | | Need to Test |
| Badge unchanged (still original state) | | Need to Test | | Need to Test |

---

### ACT-FE-006 · Reactivation modal shows correct description

| | |
|:--|:--|
| **Pre-Condition** | Admin opens row menu for deactivated member. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Click "Aktifkan anggota"
2. Verify modal title
3. Verify modal description
4. Confirm action

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Confirmation modal opens | | Need to Test | | Need to Test |
| "Aktifkan anggota" | | Need to Test | | Need to Test |
| "Anggota akan dapat masuk kembali setelah diaktifkan." shown | | Need to Test | | Need to Test |
| Toast "Anggota berhasil diaktifkan" shown. Badge updated to "Aktif". | | Need to Test | | Need to Test |

---

## TEST GROUP: ACT-SEC — Security & Mobile

### ACT-SEC-001 · Admin deactivates their own account

| | |
|:--|:--|
| **Pre-Condition** | Admin is logged in. Admin attempts to deactivate themselves. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Admin calls toggle endpoint with their own `userId`, `{ "isActive": false }`
2. Verify DB: Admin's Auth `isActive`
3. Verify Admin's sessions
4. Verify Admin's next request

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 200 returned | | Need to Test | | Need to Test |
| Set to `false` | | Need to Test | | Need to Test |
| All sessions deleted | | Need to Test | | Need to Test |
| Returns 401 (force-logged out) | | Need to Test | | Need to Test |

---

### ACT-SEC-002 · Deactivate last active Admin

| | |
|:--|:--|
| **Pre-Condition** | Only one active Admin in the workspace. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Deactivate the last active Admin
2. Verify Auth record
3. Verify workspace state

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 200 returned (no guard blocks this) | | Need to Test | | Need to Test |
| `isActive = false` | | Need to Test | | Need to Test |
| No active Admin remains (workspace may be locked) | | Need to Test | | Need to Test |

---

### ACT-SEC-003 · Concurrent toggle from two Admins

| | |
|:--|:--|
| **Pre-Condition** | Two Admin users. Same target member. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Admin A and Admin B simultaneously call toggle on same member
2. Verify both responses
3. Verify DB final state
4. Verify data integrity

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Both requests processed | | Need to Test | | Need to Test |
| Both return HTTP 200 | | Need to Test | | Need to Test |
| Last write wins — `isActive` reflects last request | | Need to Test | | Need to Test |
| No corruption, no partial state | | Need to Test | | Need to Test |

---

### ACT-SEC-004 · Mobile app self-deactivation on uninstall

| | |
|:--|:--|
| **Pre-Condition** | Mobile user is logged in with valid JWT. Mobile app sends deactivation request using the user's own token. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Mobile app calls `PATCH /auth/member/:id/toggle-active-status` with own JWT, `{ "isActive": false }`
2. Verify DB: `isActive = false`
3. Verify sessions
4. Verify mobile app subsequent request

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 200 returned | | Need to Test | | Need to Test |
| Deactivation confirmed | | Need to Test | | Need to Test |
| All sessions deleted | | Need to Test | | Need to Test |
| Returns 401 (no further authenticated calls possible) | | Need to Test | | Need to Test |

---

### ACT-SEC-005 · Mobile app deactivation with invalid/expired token

| | |
|:--|:--|
| **Pre-Condition** | Mobile app has expired or invalid JWT. |
| **Test Type** | NEGATIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Mobile app calls toggle endpoint with invalid token
2. Verify DB

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 401 returned | | Need to Test | | Need to Test |
| No state change | | Need to Test | | Need to Test |

---

### ACT-SEC-006 · Mobile app deactivation for non-existent user

| | |
|:--|:--|
| **Pre-Condition** | Mobile app calls deactivation with a non-existent or invalid `userId`. |
| **Test Type** | NEGATIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Call toggle endpoint with invalid `userId`
2. Verify response

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| HTTP 404 returned | | Need to Test | | Need to Test |
| No state change | | Need to Test | | Need to Test |

---

### ACT-SEC-007 · Mobile app re-registration after deactivation

| | |
|:--|:--|
| **Pre-Condition** | Mobile user was deactivated. Admin has reactivated the user. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Mobile user attempts login from new device
2. Verify DB: new session created
3. Verify mobile app state

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Login succeeds | | Need to Test | | Need to Test |
| Session record exists | | Need to Test | | Need to Test |
| Fully functional again | | Need to Test | | Need to Test |

---
