# Auth Regression Report

> Env: **DEV** · Ran: 2026-09-24 09:42 · Duration: 97s

| | Count |
|---|---|
| ✅ Passed | 34 |
| ❌ Failed | 7 |
| ⊘ Skipped (fixme) | 39 |

## Failing tests (7)

- `login.spec.js::check login error state`
  - Error: expect(received).toBeGreaterThanOrEqual(expected)
- `login.spec.js::invalid login with wrong password`
  - Error: expect(received).toBeGreaterThanOrEqual(expected)
- `member-toggle-active.spec.js::API: Fetch member list requires auth`
  - SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
- `member-toggle-active.spec.js::TC-005: Unauthenticated request returns 401`
  - Error: expect(received).toBe(expected) // Object.is equality
- `register.spec.js::should show validation errors for empty fields`
  - Error: expect(locator).toBeVisible() failed
- `register.spec.js::should complete full register flow with mail.tm, email verification, and onboarding`
  - Error: Failed to create account (rate limited): 429
- `sap-batch-login.spec.js::should validate all SAP login accounts`
  - Error: SAP login failures:

## Passing (34)

- `login.spec.js::check exist element on login page`
- `login.spec.js::valid login with admin credentials`
- `login.spec.js::login with empty fields`
- `login.spec.js::try login with ROLE SUPERVISOR`
- `login.spec.js::try login with ROLE AGENT`
- `member-toggle-active.spec.js::Member page loads with title, tabs, and search`
- `member-toggle-active.spec.js::Member settings page shows member table`
- `member-toggle-active.spec.js::Row menu button (three dots) is visible for first member`
- `member-toggle-active.spec.js::Search filters member list by name`
- `onboarding.spec.js::should complete successful onboarding`
- `onboarding.spec.js::should reject organization name less than minimum`
- `onboarding.spec.js::should reject organization name exceeding maximum`
- `onboarding.spec.js::should reject NIB less than minimum`
- `onboarding.spec.js::should accept NIB, NPWP and ID number with valid length`
- `onboarding.spec.js::should reject NIB with alphabet characters`
- `onboarding.spec.js::should reject NPWP less than minimum`
- `onboarding.spec.js::should reject NPWP with alphabet characters`
- `onboarding.spec.js::should reject ID number less than minimum`
- `register.spec.js::should show all required fields on register page`
- `register.spec.js::should reject duplicate email registration`
- `register.spec.js::should reject email with invalid format`
- `register.spec.js::should normalize email to lowercase`
- `register.spec.js::should reject fullname less than 3 characters`
- `register.spec.js::should reject fullname exceeding maximum length`
- `register.spec.js::should reject username less than 6 characters`
- `register.spec.js::should reject username with space`
- `register.spec.js::should reject username with special characters`
- `register.spec.js::should handle username with uppercase`
- `register.spec.js::should reject phone with less than minimum digits`
- `register.spec.js::should handle phone with special characters`
- `register.spec.js::should reject password less than 8 characters`
- `register.spec.js::should handle password without special characters`
- `register.spec.js::should reject password same as username`
- `storm-subscribers-login.spec.js::should validate all loginTypes from the storm subscriber file`
