# Auth Module — Automation Mapping

> Source specs: `sixV2Automation/playwright/tests/e2e/auth/`
> Trigger contract: `runner.js` / `server.js /api/run` → `{spec_file, grep_pattern}`.
> spec_file is RELATIVE to automation repo root. grep matches Playwright test title (auth specs have NO `[ID]` tags — grep by describe/title text).
> Last verified run: 2026-09-24 (34 passed / 7 failed / 39 skipped, 97s, env=DEV).

## Runnable buckets (use for `scope`)

| scope | spec_file | grep_pattern | real test() | notes |
|---|---|---|---|---|
| `login` | `playwright/tests/e2e/auth/login.spec.js` | `Auth Login Tests` | 8 | includes 15-min token-expiry test — exclude with `--grep-invert "becomes invalid after 15 minutes"` for fast runs |
| `register` | `playwright/tests/e2e/auth/register.spec.js` | `Register Flow Tests` | 17 | one test uses mail.tm live email — rate-limitable (429) |
| `onboarding` | `playwright/tests/e2e/auth/onboarding.spec.js` | `Onboarding Flow Tests` | 9 | org/NIB/NPWP/ID validation |
| `member-toggle` | `playwright/tests/e2e/auth/member-toggle-active.spec.js` | `Member Activate/Deactivate` | 6 | UI + API |
| `all` | `playwright/tests/e2e/auth` (dir) | *(none)* | 40 | whole auth dir; add `--grep-invert "becomes invalid after 15 minutes"` |

## Not runnable (excluded from regression)

| spec_file | reason |
|---|---|
| `member-toggle-active-scaffold.spec.js` | 39 `test.fixme` (empty bodies, auto-skip) |
| `auth-legacy.spec.js` | 0 `test()` |
| `sap-batch-login.spec.js` | batch account validator — env-dependent, fails on account drift (not a UI regression) |
| `storm-subscribers-login.spec.js` | load-sim helper, not functional regression |

## Manual-only flows (in AUTH.tsv, NO automation yet)

| flow | manual TC | automation |
|---|---|---|
| reset password / set new password | ~7 password TC | ❌ none — page object has selectors, no spec |
| verify email | present in `auth.page.js` | ❌ none |

Add specs for these when reset-pw / verify-email enter regression scope.
