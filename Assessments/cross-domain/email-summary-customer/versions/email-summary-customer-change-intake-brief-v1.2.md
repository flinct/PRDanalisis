# Change Intake Brief: E-Mail Summary Customer (Pengganti Webhook SAP)

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** Diskusi PM (Dany Christian) — request E-Mail Summary, 2026-08-03; webhook existing untuk SAP, SAP minta solusi tanpa proses webhook
> **Artifact Path:** `Assessments/cross-domain/email-summary-customer/email-summary-customer-change-intake-brief.md`
> **Version:** `v1.2`
> **Previous Version:** `v1.1` (`versions/email-summary-customer-change-intake-brief-v1.1.md`), `v1.0` (`versions/...-v1.0.md`)
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`
> **Supporting Context:** `PRD/Transcript email/PRD Inbox Conversation - reply via email.md` (spec reply-via-email, **belum shipped**); **kode BE `omnichannel-satuinbox-be@v2.7.0`** — `docs/livechat-transcript-email.md`, `apps/conversation-service/src/app/services/livechat-transcript-webhook.service.ts`, `libs/common/src/lib/interfaces/livechat-transcript-webhook.interface.ts` (transcript = **webhook**, bukan email-send)
> **Tanggal Intake:** 2026-08-03
> **Status:** Draft

---

## 0. Ringkasan Update Brief

### v1.2 (2026-08-19) — Reclassify jadi NEEDS_DEVELOPMENT (verifikasi kode BE)
Verifikasi langsung ke kode BE `omnichannel-satuinbox-be@v2.7.0` membatalkan kesimpulan v1.1:

**Realita kode (bukan asumsi PRD):**
- Transcript email existing = **webhook-based**. SatuInbox POST payload (berisi `email.subject/html/text` siap-pakai) ke webhook URL tenant (`/settings/developer/webhook`, type `LIVECHAT_TRANSCRIPT`). **Tenant (SAP) yang forward ke email service mereka sendiri** — SatuInbox tidak mengirim email sama sekali.
- Body email eksplisit: **"Please do not reply to this email"** — noreply, one-way. Continuity via link "Continue chat" (resume token widget), bukan email reply.
- PRD `PRD/Transcript email/` (reply-via-email, workspace default sender, inbound→Email conversation, auto-link, primary promotion) = **masih "In specification"** (impact matrix 2.7.0 #1286, effort 18 poin). **Belum dibangun.**

**Konsekuensi terhadap request:**
- Request = "SAP tidak mau proses webhook; SatuInbox yang kirim email summary ke customer, pakai email milik workspace SAP, customer boleh reply" → **persis fitur PRD reply-via-email #1286 yang belum shipped**.
- v1.1 `ALREADY_COVERED` **dibatalkan** — dibuat dari deskripsi PRD tanpa cek kode.
- Routing: **`NEEDS_DEVELOPMENT`** — implementasikan PRD `PRD/Transcript email/PRD Inbox Conversation - reply via email.md` (spec sudah lengkap, tidak perlu PRD baru).

**Scope development (dari PRD #1286):**
1. SatuInbox kirim transcript email langsung via email-service/SES (ganti jalur webhook untuk tenant yang opt-in) — sender + Reply-To = workspace default connected email (FR-006/007).
2. Inbound reply → Email conversation + auto-link + primary promotion (FR-016–FR-037).
3. Transisi: webhook existing tetap jalan untuk tenant lain; feature flag per workspace.

### v1.1 (2026-08-19) — DIBATALKAN
Klasifikasi `ALREADY_COVERED` berdasarkan asumsi PRD transcript sudah shipped. Salah — PRD itu spec, bukan implementasi. Model bisnis yang diklarifikasi tetap valid: SatuInbox menghubungkan customer SAP (widget) ↔ agent SAP (client SatuInbox); summary dikirim ke customer; widget close = resolved; customer boleh reply; konten = transcript.

### v1.0 (2026-08-03) — dibatalkan sebagian
Interpretasi webhook→SAP-mailbox dibatalkan di v1.1. Fakta yang bertahan: webhook existing memang diproses SAP (terbukti di kode — SAP = tenant yang forward payload webhook jadi email).

---

## 1. Request Snapshot

**Request Summary:** Setelah conversation ditutup, kirim email ringkasan percakapan ke customer. Saat ini ada webhook yang diproses pihak SAP; SAP minta solusi alternatif supaya mereka tidak perlu memproses webhook — email yang dikirim ke customer harus bisa langsung dipakai SAP.

**Business Problem:** SAP harus memproses webhook (operational overhead + dependency). Email summary ke customer adalah kebutuhan sekaligus jadi pengganti mekanisme webhook untuk SAP.

**Target User / Role / Stakeholder:** Customer (penerima email). SAP (pemakai data, tidak lagi proses webhook). Stakeholder: PM, Engineering.

**Expected Outcome:** Conversation ditutup → email summary terkirim otomatis ke customer → SAP tidak perlu proses webhook lagi (kontrak baru: email langsung).

**Urgency / Why Now:** Paket 3 task pasca-ver2.8.0, target release ver2.8.3 (21 Sep – 2 Okt). Kontrak format email dengan SAP adalah jalur kritis — diskusi harus mulai sebelum sprint 3.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | **`NEEDS_DEVELOPMENT`** (v1.1 `ALREADY_COVERED` dibatalkan; v1.0 `MIXED_REQUEST` dibatalkan) |
| Primary Domain | `Conversation` (livechat transcript) + `email` service (SES send path baru) |
| Request Shape | Add — SatuInbox jadi email sender + reply continuity (bukan webhook forwarder) |
| Initial Complexity Signal | **High** (~18 poin per impact matrix #1286) |
| Needs Split? | Opsional — Phase 1: SatuInbox-send email (ganti webhook). Phase 2: reply→Email conversation + auto-link |

### Classification Rationale (v1.2)
- Kode BE v2.7.0: transcript = webhook, tenant (SAP) yang kirim email. Noreply. Reply continuity belum ada.
- Request minta SatuInbox yang kirim email (pakai workspace email) + customer bisa reply → butuh bangun PRD reply-via-email #1286 yang masih spec.
- Spec sudah lengkap (FR-001–FR-056) → tidak perlu PRD baru, langsung build dari PRD existing.

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | `PRD/Transcript email/PRD Inbox Conversation - reply via email.md` (reply-via-email, workspace default sender, inbound→Email conv, auto-link) |
| PRD status | **Spec — "In specification", belum shipped** (impact matrix 2.7.0 #1286) |
| PRD treatment candidate | **Build as-is** — spec lengkap (FR-001–FR-056), tidak perlu PRD baru |

### 3.2 Implementation Status (verified against code — v2.7.0)
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| BE — transcript delivery | **Webhook, bukan email-send.** SatuInbox POST payload berisi `email.{subject,html,text}` siap-pakai ke webhook URL tenant; **tenant (SAP) yang kirim email**. | `docs/livechat-transcript-email.md` §4/§6/§8; `livechat-transcript-webhook.service.ts`; `livechat-transcript-webhook.interface.ts` |
| BE — sender | **Bukan workspace email SatuInbox** — email dikirim client. Body: "Please do not reply to this email" (noreply). | `docs/livechat-transcript-email.md` §8 |
| BE — reply continuity | **Belum ada.** Continuity = link "Continue chat" (resume token widget), bukan email reply. Reply→Email conversation belum dibangun. | `docs/…` §9; PRD #1286 "In specification" |
| BE — email service `:50066` | IMAP/SMTP + inbound. **Tidak dipakai untuk kirim transcript.** | `Memory/CLAUDE-be.md` |
| FE | Setting: webhook URL (`/settings/developer/webhook`), transcript toggle (`/settings/channels/widget`). | `docs/…` §1–3 |
| Runtime / Current Behavior | Widget close → SatuInbox kirim webhook ke SAP → SAP kirim email transcript ke customer (noreply). | Kode v2.7.0 |

### 3.3 Related Sources
- Kode BE `omnichannel-satuinbox-be@v2.7.0`: transcript feature (webhook path lengkap, verified).
- `PRD/Transcript email/`: spec target implementasi (FR-001–FR-056) — SatuInbox-send + reply continuity + auto-link.
- Impact matrix 2.7.0 #1286: "Customer replies to livechat transcript email create/auto-link Email conversation as Primary" — status In specification, 18 poin.

---

## 4. Scope Boundary

### 4.1 In Scope
- Email summary percakapan terkirim ke customer saat conversation ditutup (trigger: close; verifikasi apakah termasuk resolve/inactivity timeout seperti transcript).
- Konten: ringkasan percakapan (data yang selama ini dikirim lewat webhook ke SAP) — **format email langsung dipakai SAP** (subject convention + body terstruktur).
- Sender: workspace default email account (reuse aturan transcript email).
- Dedup + retry (reuse pola transcript email: 1 email per conversation+trigger, retry 3x).
- Deprecate webhook ke SAP setelah kontrak email aktif (masa transisi parallel perlu disepakati).

### 4.2 Out of Scope
- Template builder email (manual resend dari agent UI).
- Attachment terstruktur (JSON/CSV) — user sudah jawab: email langsung.
- Perubahan transcript email existing (reply continuity) — tetap jalan.
- Email marketing / broadcast.

### 4.3 Protected Existing Behavior
- Transcript email existing (reply via email, auto-linked conversation, primary promotion) tidak boleh rusak.
- Alur close conversation tidak berubah.
- Webhook SAP: tidak dihapus mendadak — transisi parallel sampai SAP siap.
- Retry/dedup semantics: tidak boleh email ganda per conversation.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | Yes | Trigger pada lifecycle close conversation |
| RBAC / visibility / assignment | No (minor) | Sender account workspace default |
| API / webhook / socket / queue / cron | **Yes** | Kontrak webhook SAP diganti email; email service + queue |
| SLA / reporting / export | No | Tidak sentuh metrik |
| Migration / rollback / feature flag | **Yes** | Feature flag per workspace; transisi parallel webhook→email |
| Existing regression scope | Yes | Transcript email flow + close conversation flow |

### Early Blast-Radius Notes
- **Kontrak eksternal (SAP):** format email harus disepakati dulu — subject convention, urutan field, format timestamp (WIB?), identitas conversation. Iterasi dengan pihak SAP = risiko jadwal terbesar.
- **Email service beban:** tambah trigger kirim email saat close — volume email naik (per closed conversation). Perlu cek rate limit SMTP/email provider.
- **Email berisi data customer:** pastikan PII aman, tidak ada data internal (internal notes, AUX, dsb).
- **Coexistence transcript vs summary:** kalau Live Chat resolve juga kirim transcript email, harus jelas apakah summary email = pengganti/lain konteks (channel email vs live chat) supaya customer tidak dapat 2 email.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | **`ROUTE_BUILD_FROM_SPEC`** (v1.1 `NO_PRD_NEEDED` dibatalkan) |
| Recommended Next Rules | `Rules/impact-analysis-rule.md`, `Rules/qa-analysis-rule.md`, `Rules/test-case-rule.md` |
| Recommended Next Artifact | Assessment Report (impact + regression) → QA pre-implementation review → build PRD #1286 |
| Can Proceed to PRD? | PRD sudah ada (`PRD/Transcript email/`, FR-001–FR-056). Butuh Assessment Report + impact analysis sebelum sprint. |

### Routing Rationale (v1.2)
- Fitur yang diminta = PRD reply-via-email #1286, masih spec. Bukan enablement, bukan patch — **build**.
- Spec lengkap → skip PRD writing, langsung Assessment Report + impact + QA strategy, lalu implementasi.
- Keputusan produk: apakah SatuInbox-send email **menggantikan** webhook (per tenant opt-in) atau **coexist**. Webhook existing tetap dipakai tenant lain.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Status v1.2 | Owner |
|----|----------------|-------------|-------|
| OQ-01 | Format email summary yang bisa dipakai SAP | **Terjawab** — PRD #1286 sudah define konten (FR-011–FR-015: summary fields + transcript body + public link + reply guidance). SAP tinggal terima. | PM |
| OQ-02 | Webhook existing: hapus/parallel? | **Masih open** — keputusan: SatuInbox-send **menggantikan** webhook (per tenant opt-in) atau **coexist**? Tenant lain yang pakai webhook tidak boleh terganggu. | PM / SAP |
| OQ-03 | Trigger: semua channel / channel tertentu? | **Terjawab** — widget (Live Chat) saja, trigger resolved/timeout (FR-001/002). | PM |
| OQ-04 | Field yang dikirim via webhook | **Terjawab** — payload webhook sudah define: `conversation{id,startTime,agentName}`, `customer{name,email,phone}`, `transcript[]`, `branding{tenantName,logoUrl,themeColor}`, `links{publicTranscriptUrl,continueChatUrl}`, `email{subject,html,text}`. PRD #1286 extend ini dengan reply-to + reference. | BE |
| OQ-05 | Kalau sudah dapat transcript email, summary tetap dikirim? | **Terjawab** — sama email (transcript = summary), dedup existing (FR-003). | PM |
| OQ-06 | Email gagal kirim → notifikasi siapa? | **Terjawab** — retry 3x + audit failed (FR-005, EH-004). | — |

**Open decisions (v1.2):**
- [ ] **Webhook coexist vs replace:** per tenant opt-in? Feature flag `TRANSCRIPT_EMAIL_SEND_MODE` = `webhook` (default) | `email` | `both`?
- [ ] **SES quota:** SatuInbox-send = semua transcript lewat SES. Cek quota per tenant vs total volume.
- [ ] **Workspace default email:** PRD #1286 butuh email connected per workspace. Verifikasi: apakah SAP workspace sudah punya email connected?
- [ ] **Phase split:** Phase 1 (SatuInbox-send email, ganti webhook) vs Phase 2 (reply→Email conv + auto-link + primary promotion)? Atau sekaligus?

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst (Dany Christian) | Scope lock | Pending | |
| SAP | Format email + transisi webhook | Pending | Jalur kritis — mulai diskusi secepatnya (parallel ver2.8.1/2.8.2) |
| FE / BE / Tech Lead | Sanity check trigger + email service capacity | Pending | |
| QA | UAT email real + regression transcript | Pending | |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD | Patch `PRD/Transcript email/` | source scope, kontrak SAP, protected behavior |
| Assessment Report | `Assessments/cross-domain/email-summary-customer/` | impact flags, external dependency |
| QA Pre-Implementation Review | template Setup | trigger matrix, email test strategy |
| QA Post-Implementation Validation | template Setup | UAT email real, transisi webhook |
| Automation Mapping / Test Spec | sixV2Automation | trigger + dedup traceability |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-08-03 | Initial brief created | Dany Christian |
| 2026-08-19 | v1.1 — model bisnis clear, reclassify ALREADY_COVERED. **Dibatalkan di v1.2.** | Dany Christian |
| 2026-08-19 | v1.2 — verifikasi kode BE v2.7.0: transcript = webhook (bukan email-send), noreply, reply continuity belum ada. Reclassify NEEDS_DEVELOPMENT / ROUTE_BUILD_FROM_SPEC. PRD #1286 = spec target. v1.1 ALREADY_COVERED dibatalkan (asumsi dari PRD tanpa cek kode). | Dany Christian |
