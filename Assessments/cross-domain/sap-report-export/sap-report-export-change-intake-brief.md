# Change Intake Brief: SAP Report Export (General)

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** Diskusi PM (Dany Christian) — request Exporting Report, 2026-08-03; contoh output: `.hermes/desktop-attachments/SatuInbox_SAP_Report_31_07_2026.xlsx` (4 sheet, 47.5 MB)
> **Artifact Path:** `Assessments/cross-domain/sap-report-export/sap-report-export-change-intake-brief.md`
> **Version:** `v1.0`
> **Status:** **CONSUMED** by `Assessments/general/sap-report-export/sap-report-export-change-intake-brief.md` (v3.0) — SAP template becomes Sub-PRD D preset within general configurable export system. This brief remains as reference; its column specs and OQs carry forward.
> **Previous Version:** `none`
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`
> **Supporting Context:** `PRD/Analytics/PRD Analytics - offline report download.md`, `PRD/ticketv2/PRD Ticket - Export Ticket List (XLSX).md`, `Memory/CLAUDE-be.md`
> **Tanggal Intake:** 2026-08-03
> **Status:** CONSUMED (v3.0 general brief)

---

## 0. Ringkasan Update Brief

- Initial version. Request "Exporting Report berdasarkan filter, adaptasi dari screenshot Kapture / contoh Excel SAP" diklarifikasi: **general untuk semua customer** (bukan custom per-SAP), output mengikuti struktur contoh file SAP (4 sheet).
- Routing decision: `ADDITIVE_IMPROVEMENT` + `ROUTE_PATCH_EXISTING_PRD` — reuse Offline Report Download yang sudah ship, tambah template SAP.

---

## 1. Request Snapshot

**Request Summary:** Export report berdasarkan filter yang dipilih user, format mengikuti contoh Excel SAP (4 sheet: Report Ticket, Report Conversation, Report Effective Hour, Raw AUX). Tidak lagi manual via Mas Rayyan — user download langsung dari sistem.

**Business Problem:** Report SAP di-provide manual oleh Mas Rayyan (ekstrak DB + kirim file). Proses manual = lambat, rawan human error, tidak scalable.

**Target User / Role / Stakeholder:** Admin & Supervisor (sesuai RBAC Offline Report Download existing). Stakeholder: SAP (penerima file), Mas Rayyan (pemilik proses manual).

**Expected Outcome:** User memilih filter → sistem generate file XLSX multi-sheet (struktur SAP) → download. Proses manual Mas Rayyan berhenti.

**Urgency / Why Now:** Paket 3 task pasca-ver2.8.0, target release ver2.8.2 (31 Aug – 18 Sep). Testing butuh data incremental harian → durasi 3 minggu.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `ADDITIVE_IMPROVEMENT` |
| Primary Domain | `Analytics` |
| Request Shape | Add (template export baru + RBAC export) |
| Initial Complexity Signal | Low (dev) / Medium (testing: volume besar + incremental data) |
| Needs Split? | No |

### Classification Rationale
- Infrastruktur export async sudah ada (Offline Report Download: job, queue, retention 7 hari, XLSX, filter tanggal/employee/status). Yang ditambah = **template SAP** (definisi sheet + kolom + mapping data).
- Testing berat karena volume: contoh file 169k baris ticket, 88k conversation, 65k effective hour — validasi akurasi butuh data real yang nambah harian.

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | `PRD/Analytics/PRD Analytics - offline report download.md` (channel Ticket/Conversation, async job, retention 7 hari, max 30 hari), `PRD/ticketv2/PRD Ticket - Export Ticket List (XLSX).md` |
| PRD status | Existing (shipped) |
| PRD treatment candidate | Patch (tambah template SAP) |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | Shipped — halaman Offline Report Download aktif | PRD + timesheet (Offline Report Download phase 2 tested 2026-05-21) |
| BE | Shipped — export job infra (ticket-service `:50064` exports, analytics-service reports) | `Memory/CLAUDE-be.md` |
| Runtime / Current Behavior | Export XLSX single-channel (Ticket ATAU Conversation). SAP minta multi-sheet sekaligus | Contoh file SAP |

### 3.3 Related Sources
- Contoh output SAP (analisa 2026-08-03): 
  - **Report Ticket** 35 kolom: Ticket ID, Ticket Number, AWB, Created/Closed Datetime (WIB), Created/Closed By, Participants, Status, Current Stage, Assign By, Channel, Tribe, Type Complaint, Investigation Status, Diff Time First Assign And First Response, AVG Responsetime, Handling Time, Diff Time Resolved and Created, CSAT, Ticket All Remarks, Title, Priority, Unattended, Open, On Progress Dalam Penanganan Cabang, Updated Cabang, On Progress Dalam Konfirmasi Client, Dikembalikan ke Cabang, Done, Comment CSAT
  - **Report Conversation** 27 kolom: Conversation ID/Number, Status, Ticket ID/Number, Created/Closed Datetime, Closed By, Participants, Assign By, Jam Chat In (T1), Jam Chat Masuk Bucket Agent (T2), Jam Respon Pertama (T3), Channel, Diff Time First Assign And First Response, AVG Responsetime, Handling Time, Diff Time Resolved and Created, Contact ID, Topic, Sub-Topic, Contact Name, Contact Phone, Contact Email
  - **Report Effective Hour** 6 kolom: Shift Date, User ID, fullname, Work Hours Shift, Total Shift Away, Effective Work Shift Hour
  - **Raw AUX** 9 kolom: Shift Date, User ID, User Name, Reason Away, Start Shift, End Shift, Start Away, End Away, Total Away
- Stage durations (Unattended/Open/On Progress/Updated/Done) = status stage ticket; mapping ke data stage/activity ticket perlu konfirmasi BE
- `Memory/CLAUDE-be.md`: analytics-service = reports/exports; per-service DB isolation → kolom lintas-service (presence/AUX dari people-service?) perlu gRPC/snapshot

---

## 4. Scope Boundary

### 4.1 In Scope
- Template export baru **"SAP Report"** di halaman Offline Report Download (channel: Ticket + Conversation + Effective Hour + AUX dalam satu file multi-sheet).
- Struktur kolom mengikuti contoh file SAP (4 sheet di atas) — general, bukan khusus satu customer.
- Filter: reuse filter existing (date range, employee, status) + channel multi-select.
- RBAC export: Admin/Supervisor (ikuti Offline Report Download existing). Role Agent — keputusan OQ-01.
- Format XLSX, job async, retention 7 hari (reuse infra existing).

### 4.2 Out of Scope
- Custom template per-customer / per-SAP (general).
- Perubahan struktur file yang sudah disepakati SAP (kalau berubah, brief di-update).
- Dashboard/visualisasi baru.
- Scheduled/email delivery report (belum).

### 4.3 Protected Existing Behavior
- Offline Report Download existing (Ticket/Conversation single-channel) tetap jalan, tidak berubah.
- Export Ticket List XLSX existing tetap.
- Format kolom kanonik di halaman export existing tidak boleh rusak.
- Timezone: contoh file pakai WIB (Created Datetime (WIB)) — konsisten dengan workspace timezone Asia/Jakarta.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | No | Baca-only, snapshot saat job jalan |
| RBAC / visibility / assignment | Yes | Scope export (Admin/Supervisor), data assignee di kolom |
| API / webhook / socket / queue / cron | Yes (minor) | Job queue existing dipakai; mungkin perlu worker config untuk file besar (169k+ baris) |
| SLA / reporting / export | **Yes** | Inti: template + multi-sheet + volume besar |
| Migration / rollback / feature flag | Yes | Template baru = additive; rollback = hapus template |
| Existing regression scope | Yes | Export existing + job infra |

### Early Blast-Radius Notes
- **Volume:** file SAP contoh 47.5 MB, 169k baris. Job processor existing harus sanggup; kalau tidak → config batch/streaming saat generate XLSX.
- **Kolom cross-service:** Effective Hour + Raw AUX kemungkinan dari people-service (presence/AUX) — perlu verifikasi sumber data & path gRPC/snapshot, jangan query langsung DB service lain (aturan per-service DB isolation).
- **AUX duration data quality:** contoh file ada anomali (Total Away 42:48:26 untuk 1 record Sholat) — verifikasi definisi perhitungan sebelum mapping.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_PATCH_EXISTING_PRD` |
| Recommended Next Rules | `Rules/prd-writing-rule.md`, `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/test-case-rule.md` |
| Recommended Next Artifact | Patch PRD Offline Report Download (section template SAP) |
| Can Proceed to PRD? | Yes (setelah OQ-01/02/03 terjawab) |

### Routing Rationale
- Infra export sudah ada → patch PRD existing. Effort dev kecil; effort testing dominan (volume + akurasi + incremental data).
- Kebutuhan spesifikasi kolom: verifikasi mapping tiap kolom ke sumber data BE sebelum PRD final.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | Role Agent boleh export SAP report juga, atau tetap Admin/Supervisor? | Menentukan RBAC & cakupan test | Yes | PM |
| OQ-02 | 4 sheet selalu di-generate sekaligus, atau user pilih sheet? | Effort dev + ukuran file + durasi job | Yes | PM |
| OQ-03 | Definisi stage durations (Unattended/Open/On Progress/Done) — mapping ke data stage mana? | Kolom 28–34 ticket; harus diverifikasi ke BE (ticket stage history?) | Yes | BE / PM |
| OQ-04 | Batas tanggal untuk Effective Hour & Raw AUX — sama dengan filter utama atau range sendiri? | Data presence mungkin tidak selengkap ticket/conversation | No | PM |
| OQ-05 | Konfirmasi ke pihak SAP: struktur 4 sheet + kolom final diterima apa adanya? | File ini jadi kontrak output | Yes | PM / SAP |
| OQ-06 | Topik/Sub-Topic conversation (hanya 99/999 terisi di contoh) — dari mana sumbernya? | Kolom jarang terisi; perlu sumber data valid | No | BE |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst (Dany Christian) | Scope lock | Pending | |
| Mas Rayyan | Proses manual handover + validasi output | Pending | Pemilik proses existing |
| SAP | Konfirmasi struktur file | Pending | OQ-05 |
| FE / BE / Tech Lead | Sanity check volume & cross-service data | Pending | |
| QA | Test strategy volume besar | Pending | |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD | Patch `PRD/Analytics/PRD Analytics - offline report download.md` | source scope, template spec, protected behavior |
| Assessment Report | `Assessments/cross-domain/sap-report-export/` | impact flags, volume risk |
| QA Pre-Implementation Review | template Setup | volume test strategy, mapping kolom |
| QA Post-Implementation Validation | template Setup | akurasi vs contoh file SAP, incremental data |
| Automation Mapping / Test Spec | sixV2Automation | filter + template traceability |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-08-03 | Initial brief created | Dany Christian |
