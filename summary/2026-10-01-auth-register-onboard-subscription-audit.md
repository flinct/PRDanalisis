# Session Summary — Audit Auth / Register / Onboard / Subscription + Flow + Competitor Research

**Tanggal:** 2026-10-01
**Tipe tugas:** Audit corpus (decision-bearing) + competitor deep research
**Rules dibaca:** `Rules/core/task-router.md`, `Rules/core/audit.md`, `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`, `WORKFLOW_CONTEXT.md`
**Owner:** Analyst (Dany Christian = PM)

---

## Scope (dikonfirmasi user via Clarify)

- Target: semua sumber (PRD + BE + FE), cari sendiri
- Status: fitur sudah ada sebagian → audit gap
- Kompetitor: campuran (omnichannel CS + SaaS subscription referensi)
- Output: Assessment Report di `Assessments/` dengan diagram

## Temuan Kunci (progres)

- **PRD:** auth/register/onboard/subscription TIDAK punya PRD di `PRD/`. Nol hit. Domain ini undocumented di workspace.
- **BE repo:** `omnichannel-satuinbox-be` TIDAK ter-clone di mesin ini → BE evidence dari `Memory/CLAUDE-be.md` (verified 2026-08-11, branch v2.8.0). Tandai "memory-sourced".
- **FE repo:** `omnichannel-satuinbox-fe` ADA (branch data-cy, commit 7632dd92) → code-verified.
- **Existing assessments relevan (konteks, bukan duplikat):**
  - `Assessments/auth/dual-registration-flow/` (2026-06, usul personal vs org split — belum terimplementasi)
  - `Assessments/auth/superadmin-global-company-access/`
  - `Assessments/cross-domain/referral-subscription-and-superadmin-global-access/` (2026-06)
  - `summary/2026-09-23-meeting-brief-uiux-subscription-sales.md`

## FE flow (code-verified)

- Auth: NextAuth Credentials → BE `/auth/login`; JWT session + refresh (`/auth/refresh-token`); no SSO/social.
- Register 2 jenis: company-owner self-signup (`/auth/register`) + invited member (token-bound, `/auth/validate-member`).
- Onboarding: 4-state machine `OnboardingStatusEnum` (onboarding→waiting_approval→approved/rejected). Manual admin approval gate. Field KYC Indonesia: NIB(13)/NIK(16)/NPWP(15) semua optional, company name wajib. Submit → `/company/register`.
- Gate: `proxy.ts:406-416` paksa non-APPROVED ke `/onboarding`.
- Subscription: plan (month/year, duration/unit), add-ons, voucher, proration → `/payment/subscriptions`. Wallet/top-up/quota (`/wallet/*`), invoice, billing-cycles, token log, usage. Gateway "API Bayar" (env).

## Findings awal (akan masuk register)

- `NEXT_PUBLIC_SECRET` dipakai sebagai NextAuth signing secret → public env var exposure (security smell).
- `ManageOnboardingPage` tak punya branch render REJECTED → blank page untuk user rejected.
- Axios refresh (`useAxiosPrivateApi.ts`) tanpa shared mutex → potensi refresh-storm saat burst 401 paralel.

## Status — SELESAI

- [x] Rules + memory + flow FE verified
- [x] Competitor deep research (2 subagent, deleg_5b388d74) → benchmark ter-tulis
- [x] Assessment Report + 4 diagram (mermaid) ditulis
- [x] global-memory diupdate (shadow-domain flag)

## Deliverable

- `Assessments/audit/detail-auth/auth-register-onboard-subscription-audit.md` — Assessment Report (v1.0): flow diagrams, 11 findings (3×P0, 4×P1, 4×P2), benchmark, traceability. **Folded ke register `01` sebagai Track K (AUTH-01..11)**; benchmark di `detail-auth/reference/`.
- `.../reference/competitor-register-onboarding-benchmark.md` — 5 platform CS (Intercom/Zendesk/Freshchat/Qiscus/Crisp).
- `.../reference/competitor-subscription-billing-benchmark.md` — 7 platform (+ Slack/Notion/Linear).

## Findings P0

1. AUTH-01 shadow domain (0 PRD/memory/test)
2. AUTH-02 REJECTED → blank page (ManageOnboardingPage no branch)
3. AUTH-03 `NEXT_PUBLIC_SECRET` sbg NextAuth signing secret (browser-exposed)
