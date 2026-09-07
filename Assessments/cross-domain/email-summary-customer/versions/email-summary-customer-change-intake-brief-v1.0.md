# Change Intake Brief: E-Mail Summary Customer (Pengganti Webhook SAP)

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** Diskusi PM (Dany Christian) — request E-Mail Summary, 2026-08-03; webhook existing untuk SAP, SAP minta solusi tanpa proses webhook
> **Artifact Path:** `Assessments/cross-domain/email-summary-customer/email-summary-customer-change-intake-brief.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`
> **Supporting Context:** `PRD/Transcript email/PRD Inbox Conversation - reply via email.md` (transcript email + reply continuity), `Memory/CLAUDE-be.md` (email service `:50066` — IMAP/SMTP, transcript emails)
> **Tanggal Intake:** 2026-08-03
> **Status:** Draft

---

## 0. Ringkasan Update Brief

- Initial version. Request "E-Mail Summary: ringkasan percakapan email ke customer setelah conversation ditutup, webhook existing untuk SAP, SAP minta solusi lain tanpa proses webhook" diklarifikasi Q3: **email langsung berisi data yang bisa dipakai SAP** — bukan webhook, bukan JSON/attachment terstruktur.
- Routing decision: `ADDITIVE_IMPROVEMENT` + `ROUTE_PATCH_EXISTING_PRD` — infrastruktur transcript email sudah ada; tambah summary email + hentikan/menggantikan webhook.

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
| Change Class | `BEHAVIOR_CHANGE` (webhook → email) + `ADDITIVE_IMPROVEMENT` (summary email) → `MIXED_REQUEST` |
| Primary Domain | `Conversation` / `Cross-domain` (email service) |
| Request Shape | Change (kontrak integrasi SAP) + Add (email summary) |
| Initial Complexity Signal | High |
| Needs Split? | No (satu kesatuan: summary email menggantikan webhook) |

### Classification Rationale
- Mengubah kontrak integrasi dengan pihak eksternal (SAP) = behavior change, perlu sinkronisasi/kesepakatan format.
- Menambah mekanisme email summary = additive improvement di atas transcript email existing.
- Kompleksitas tinggi karena: trigger saat close, template email, kontrak format SAP, koordinasi eksternal, testing email real.

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | `PRD/Transcript email/PRD Inbox Conversation - reply via email.md` (transcript email saat resolved/timeout, sender = workspace default email, Reply-To continuity) |
| PRD status | Existing (shipped) |
| PRD treatment candidate | Patch (tambah email summary + kontrak SAP) |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | N/A (email flow BE-side) | |
| BE | Shipped — email service `:50066` IMAP/SMTP + transcript emails; trigger transcript saat resolve/inactivity timeout | `Memory/CLAUDE-be.md` |
| Runtime / Current Behavior | Webhook terkirim ke SAP saat conversation ditutup (mekanisme existing, diproses SAP) | Request user; detail implementasi webhook perlu diverifikasi BE |

### 3.3 Related Sources
- `PRD/Transcript email/`: FR-001–FR-015 (trigger, sender, konten transcript, dedup, retry 3x) — pola yang bisa dipakai ulang untuk summary email
- `Memory/CLAUDE-be.md`: email service, event-driven pattern (denormalized snapshots via events), retry pattern transcript
- Webhook SAP existing: path/format perlu diverifikasi di repo BE (belum ditemukan di PRD — `grep webhook` tidak menemukan dokumen khusus)

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
| Routing Decision | `ROUTE_PATCH_EXISTING_PRD` |
| Recommended Next Rules | `Rules/prd-writing-rule.md`, `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | Patch PRD Transcript email (section E-Mail Summary + kontrak SAP) |
| Can Proceed to PRD? | Yes setelah OQ-01 (format email) dikunci dengan SAP |

### Routing Rationale
- Infra email + transcript sudah ada; perubahan = template summary + trigger + deprecate webhook. Patch PRD existing lebih tepat.
- Kontrak format email harus dikunci sebelum PRD final — kalau SAP belum jawab, stage Hold.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | Format email summary yang bisa dipakai SAP: struktur body/subject/field apa? (perlu meeting dengan SAP) | Ini kontrak baru pengganti webhook — wajib disepakati | Yes | PM / SAP |
| OQ-02 | Webhook existing: dihapus total setelah email live, atau masa transisi parallel? Berapa lama? | Menentukan deprecation & rollback plan | Yes | PM / SAP |
| OQ-03 | Trigger summary email: semua channel atau hanya channel tertentu (Email/Live Chat)? Bagaimana dengan conversation yang di-close otomatis (timeout)? | Cakupan trigger & volume email | Yes | PM |
| OQ-04 | Isi ringkasan: apa saja field yang sekarang dikirim via webhook? (verifikasi implementasi webhook di BE) | Sumber data konten email | Yes | BE |
| OQ-05 | Kalau conversation sudah pernah dapat transcript email (Live Chat resolve), summary email tetap dikirim? | Anti email ganda | Yes | PM |
| OQ-06 | Email gagal kirim (provider down) — retry 3x lalu status failed; perlu notifikasi ke siapa? | Error handling | No | PM |

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
