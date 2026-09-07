# Change Intake Brief: E-Mail Summary Customer (Pengganti Webhook SAP)

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** Diskusi PM (Dany Christian) — request E-Mail Summary, 2026-08-03; webhook existing untuk SAP, SAP minta solusi tanpa proses webhook
> **Artifact Path:** `Assessments/cross-domain/email-summary-customer/email-summary-customer-change-intake-brief.md`
> **Version:** `v1.1`
> **Previous Version:** `v1.0` (`versions/email-summary-customer-change-intake-brief-v1.0.md`)
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`
> **Supporting Context:** `PRD/Transcript email/PRD Inbox Conversation - reply via email.md` (transcript email + reply continuity), `Memory/CLAUDE-be.md` (email service `:50066` — IMAP/SMTP, transcript emails)
> **Tanggal Intake:** 2026-08-03
> **Status:** Draft

---

## 0. Ringkasan Update Brief

### v1.1 (2026-08-19) — Reclassify jadi ALREADY_COVERED
Model bisnis diklarifikasi PM: SatuInbox = chat platform yang menghubungkan **customer SAP** (end-user via widget) dengan **agent SAP** (SAP = client/tenant SatuInbox). Summary email dikirim ke **customer** setelah percakapan widget berakhir, dari email workspace SAP.

Klarifikasi keputusan PM (2026-08-19):
- Widget **"close" = "resolved"** — titik trigger identik dengan transcript email existing.
- Perilaku **ikut transcript email** existing.
- Customer **boleh reply** di email (reply-to continuity).
- Konten = **transcript** (bukan format baru).

→ Semua requirement **sudah di-cover 100% oleh transcript email existing** (`PRD/Transcript email/`, shipped). Tidak ada gap. **Tidak ada development baru.**
→ Routing berubah: `ADDITIVE_IMPROVEMENT` → **`ALREADY_COVERED`**. `ROUTE_PATCH_EXISTING_PRD` → **`NO_PRD_NEEDED`** (enablement/verifikasi saja).
→ Asumsi v1.0 (webhook→email untuk SAP mailbox) **dibatalkan** — recipient = customer widget, bukan SAP. Bagian webhook SAP dari request ini gugur; jika masih ada kebutuhan feed data ke SAP, itu request terpisah.

### v1.0 (2026-08-03) — dibatalkan sebagian
Request awal diklarifikasi Q3: email berisi data yang bisa dipakai SAP, menggantikan webhook. Interpretasi recipient=SAP/webhook-swap **dibatalkan di v1.1** setelah model bisnis clear.

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
| Change Class | **`ALREADY_COVERED`** (v1.0: `MIXED_REQUEST` — dibatalkan) |
| Primary Domain | `Conversation` (Live Chat / widget → transcript email existing) |
| Request Shape | None — enablement/verifikasi fitur existing |
| Initial Complexity Signal | **None** (nol development) |
| Needs Split? | No |

### Classification Rationale (v1.1)
- Widget close = resolved → transcript email existing sudah trigger di titik ini (FR-001/002).
- Recipient customer, sender workspace default email, reply-to continuity, konten summary → semua sudah FR transcript email (FR-006/007/011).
- Tidak ada trigger baru, konten baru, atau recipient baru. Bukan feature dev — cukup pastikan fitur aktif untuk workspace SAP.

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
| Routing Decision | **`NO_PRD_NEEDED`** (v1.0: `ROUTE_PATCH_EXISTING_PRD` — dibatalkan) |
| Recommended Next Rules | None (fitur existing) |
| Recommended Next Artifact | None — enablement + QA verifikasi transcript email untuk workspace SAP |
| Can Proceed to PRD? | N/A — tidak ada PRD; transcript email (`PRD/Transcript email/`) sudah cover |

### Routing Rationale (v1.1)
- Widget close=resolved, recipient customer, sender workspace email, reply continuity, konten summary → 100% = transcript email existing. Tidak ada delta yang perlu PRD.
- Sisa kerja = **enablement** (pastikan transcript email aktif + workspace default email SAP connected) + **QA verifikasi** end-to-end di widget SAP. Bukan development.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Status v1.1 | Owner |
|----|----------------|-------------|-------|
| OQ-01 | Format email summary yang bisa dipakai SAP | **Gugur** — konten = transcript existing, bukan format SAP baru | — |
| OQ-02 | Webhook existing: hapus/parallel? | **Gugur** — recipient = customer, bukan SAP mailbox; webhook di luar scope request ini | — |
| OQ-03 | Trigger: semua channel / channel tertentu? | **Terjawab** — widget (Live Chat) saja, trigger resolved/timeout existing | PM |
| OQ-04 | Field yang dikirim via webhook | **Gugur** — konten = transcript existing | — |
| OQ-05 | Kalau sudah dapat transcript email, summary tetap dikirim? | **Terjawab** — sama email (transcript = summary), dedup existing FR-003 cegah dobel | PM |
| OQ-06 | Email gagal kirim → notifikasi siapa? | **Terjawab** — pakai retry 3x + audit failed existing (FR-005, EH-004) | — |

**Verifikasi enablement (sebelum tandai done):**
- [ ] Transcript email aktif/enabled untuk workspace SAP.
- [ ] Workspace default email account SAP connected + active (kalau tidak → EH-001/002 block).
- [ ] Widget capture customer email (transcript butuh customer email; kalau kosong → EH-003 skip).

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
| 2026-08-19 | v1.1 — model bisnis clear (recipient=customer widget, close=resolved, ikut transcript, reply-continuity, konten=transcript). Reclassify `ALREADY_COVERED` / `NO_PRD_NEEDED`. Asumsi webhook→SAP v1.0 dibatalkan. OQ-01/02/04 gugur, OQ-03/05/06 terjawab oleh transcript email existing. Sisa = enablement + QA verifikasi. | Dany Christian |
