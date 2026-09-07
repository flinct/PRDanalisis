# Session Summary — Email Summary: Verifikasi Kode → NEEDS_DEVELOPMENT

## Tanggal
2026-08-19

## Request user
1. Cek apakah SatuInbox sudah punya fitur email summary report (dev bilang ada webhook).
2. Brainstorm + analisa impact kalau develop email summary.
3. Klarifikasi model bisnis: SAP = client SatuInbox, customer chat via widget, summary email ke customer setelah close.
4. Cek poin 1 (sender transcript email) dari kode BE.

## Progres

### Turn 1–3: Analisa + model bisnis
- Brief v1.0 existing ditemukan. Asumsi awal: recipient = SAP mailbox (webhook swap).
- Klarifikasi: recipient = customer widget, sender = workspace email SAP, customer boleh reply.
- v1.1: reclassify ALREADY_COVERED (asumsi transcript email existing sudah cover semua).

### Turn 4: Verifikasi kode BE (CRITICAL CORRECTION)
- Clone BE ada di `Desktop/BE satuinbox/omnichannel-satuinbox-be`, branch `v2.7.0`.
- Temuan: **transcript email = webhook-based**, bukan email-send.
  - SatuInbox POST payload (`email.{subject,html,text}` siap-pakai) ke webhook URL tenant.
  - **Tenant (SAP) yang kirim email** — SatuInbox tidak mengirim email sama sekali.
  - Body: "Please do not reply to this email" — noreply, one-way.
  - Reply continuity = link "Continue chat" (resume token widget), bukan email reply.
- PRD reply-via-email (`PRD/Transcript email/`, #1286) = **masih "In specification"**, belum shipped.
- v1.1 ALREADY_COVERED **dibatalkan** — dibuat dari asumsi PRD tanpa cek kode.

### v1.2: Reclassify NEEDS_DEVELOPMENT
- Request = persis PRD #1286 yang belum dibangun.
- Routing: ROUTE_BUILD_FROM_SPEC — build dari PRD existing (FR-001–FR-056), tidak perlu PRD baru.
- Scope: (1) SatuInbox-send email via SES, (2) reply→Email conv + auto-link + primary promotion, (3) feature flag per tenant.

## Artifact
- Brief v1.2: `Assessments/cross-domain/email-summary-customer/email-summary-customer-change-intake-brief.md`
- Versions: v1.0, v1.1 di `versions/`

## Open decisions
- Webhook coexist vs replace (per tenant opt-in?)
- SES quota check
- Workspace default email SAP connected?
- Phase split (email-send dulu vs sekaligus reply continuity)

## Lesson learned
**Jangan classify fitur dari PRD/deskripsi saja — verifikasi ke kode.** PRD bilang "shipped" tapi kode = webhook, bukan email-send. Gap antara PRD dan implementasi = sumber salah klasifikasi terbesar.

## Review ulang (v1.3, 2026-08-31)
Deep-verify kode koreksi 4 detail v1.2 (reklasifikasi tetap valid):
1. **Trigger = widget CLOSE (scheduled)** via `scheduleOnClose`, bukan resolve/timeout. Queue `LIVECHAT_TRANSCRIPT_SEND`.
2. **Email-channel outbound = nodemailer SMTP per-account** (`EMAIL_SEND_MESSAGE`, mailbox tenant). SES v2 ada di dep tapi transcript/channel tidak lewat SES.
3. **Infra send email sudah ada, belum di-wire ke transcript** → effort Phase 1 turun (reuse, bukan bangun pipeline).
4. **Reply continuity = 0 match** (hard confirm).
5. **Sender = mailbox tenant connected** → SAP wajib connect Email channel account. Blocker keras.

## Lock keputusan + PRD (v1.4, 2026-08-31)
PM lock 3 keputusan → brief v1.4 → PRD dibuat:
1. **Webhook COEXIST** — flag `TRANSCRIPT_EMAIL_SEND_MODE` per tenant (`webhook` default | `email` | `both`).
2. **Mailbox tenant = precondition wajib** — connect Email channel account dulu untuk mode email/both.
3. **1 PRD, 2 phase** — Phase 1 = send mode (baru), Phase 2 = reply continuity (reference #1286).

**Artifact:**
- PRD baru: `PRD/Transcript email/PRD Email Summary - SatuInbox send mode.md` (Phase 1 + phasing, 16 section, FR-001-020).
- PRD #1286 (`PRD Inbox Conversation - reply via email.md`): flag pointer banner + revision v1.1 (Phase 2 depends Phase 1, reply hanya aktif mode email/both). No FR change.
- Brief -> v1.4, versions/ snapshot v1.0-v1.3.
