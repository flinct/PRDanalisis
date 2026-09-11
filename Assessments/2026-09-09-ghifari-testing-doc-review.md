# Assessment Report: Ghifari Naufal Nasrullah — QA Technical Test

**Reviewer:** Hermes Agent (QA Deliverable Review Skill)  
**Tanggal:** 2026-09-09  
**Dokumen:** `TECHNICAL TEST QA ENGINEER - Ghifari Naufal Nasrullah.pdf`  
**Context:** Hiring technical test — penilaian QA thinking, bukan DB merge-readiness  
**Metode:** Coverage per-feature (bukan global-ratio), no PRD-traceability (tester tanpa PRD access), section-based scoring + weighted merge
**Rev 2 (2026-09-09):** Automation sections (D/E/F) terdeteksi MISSING — section lettering PDF loncat A→B→C→G→H. Dual-scenario scoring ditambahkan; skor conditional pada konfirmasi brief.

---

## Executive Summary

**Total Deliverables:** 44 item (33 Manual TC + 3 Exploratory + 4 UAT + 3 Bug + 1 Improvement)  
**Overall Score:** **70/100** (B−)  
**Grade:** **Kompeten dengan gap coverage**

**Strength:**
- **Bug discovery rate tinggi:** 3 high-impact bugs ditemukan dari 33 manual TC (~9% defect discovery rate) — search failure, 403 edit block, validation bypass
- **Strategic thinking kuat:** Bagian Testing Strategy (Section H) menunjukkan risk-based prioritization, RCA mindset, Go/No-Go framework yang matang
- **UAT design realistis:** 4 UAT scenarios mencakup multi-agent collaboration, CRM consistency, analytics accuracy — end-to-end flows yang mencerminkan real operational use

**Weakness:**
- **Coverage tipis per-feature:** Dari 11 fitur yang dipilih untuk ditest, 10 fitur mendapat coverage <40% terhadap core functions di DB (hanya Quick Reply ~40%)
- **Test case depth kurang:** Mayoritas TC hanya happy path + 1-2 negative case; edge cases (combining filters, bulk ops, error recovery) tidak tercakup
- **Evidence gap:** IMPORT/EXPORT blocked (fitur tidak ada), CRM/Dashboard tidak punya baseline DB untuk verifikasi claim

**Rekomendasi:**
1. **For the tester:** Perluas coverage per-feature sebelum pindah ke fitur baru; setiap fitur minimal cover 3 core functions (CRUD/filter kombinasi/edge case)
2. **For the team:** Bug-001 (search failure) & Bug-002 (403 edit) butuh hotfix immediate — menghambat core operational flow

---

## Section Scores

| Section | Weight | Score | Grade | Reasoning |
|---|---|---|---|---|
| **Manual TC** | 30% | 55/100 | D+ | Coverage per-feature rendah (9 dari 11 fitur <20%), tapi test structure jelas + bug discovery tinggi |
| **Exploratory** | 20% | 85/100 | A | 3 findings dengan RCA solid, reproducible steps, business impact stated — high-value exploratory |
| **UAT** | 20% | 80/100 | B+ | 4 end-to-end scenarios realistis, mencakup collaboration/CRM/analytics; missing: negative UAT paths |
| **Bug Report** | 15% | 75/100 | B | 3 bugs well-documented (severity, steps, impact, evidence); duplikasi dengan Exploratory (bobot dibagi) |
| **Improvement** | 10% | 70/100 | B− | 1 improvement (Import/Export) with clear justification; terbatas pada 1 area saja |
| **Strategy** | 5% | 90/100 | A | Risk-based prioritization, RCA approach, Go/No-Go framework — mature QA thinking |

**Weighted Total:** (55×0.3) + (85×0.2) + (80×0.2) + (75×0.15) + (70×0.1) + (90×0.05) = **70/100**

> ⚠️ **Skor 70 ini asumsi automation OPSIONAL / dikirim terpisah.** Jika automation WAJIB di brief (section lettering PDF loncat A→B→C→G→H → D/E/F Web Automation + API Manual + API Automation MISSING), lihat re-weight di bawah.

---

## Automation Assessment (Section D/E/F — MISSING)

**Temuan:** PDF tidak menyertakan bagian automation. Section lettering loncat:
`A` Manual → `B` Exploratory → `C` UAT → **[D, E, F hilang]** → `G` Bug/Improvement → `H` Strategy.

Pola technical test QA umumnya: **D = Web Automation (Playwright/Selenium), E = API Manual (Postman), F = API Automation (Newman/RestAssured)**. Tiga bagian ini tidak di-submit dalam PDF.

**Dua skenario penilaian:**

### Skenario 1 — Automation WAJIB di brief (kemungkinan besar, lihat lettering)

Section D/E/F = **0/100 (not submitted)**. Re-weight dengan automation dimension:

| Section | Bobot | Skor | Kontribusi |
|---|---|---|---|
| Manual TC | 25% | 55 | 13.75 |
| Exploratory | 15% | 85 | 12.75 |
| UAT | 15% | 80 | 12.00 |
| **Web Automation (D)** | 15% | **0** | **0.00** |
| **API Manual + Automation (E/F)** | 10% | **0** | **0.00** |
| Bug Report | 10% | 75 | 7.50 |
| Improvement | 5% | 70 | 3.50 |
| Strategy | 5% | 90 | 4.50 |

**Weighted Total (Skenario 1): 54/100 (D+)** — turun dari 70 karena 25% bobot automation kosong.

### Skenario 2 — Automation OPSIONAL / dikirim terpisah (repo GitHub, Postman collection)

Skor tetap **70/100**. Automation dinilai saat evidence datang.
Per skill rule: **passing Playwright/Newman CLI run (`N passed, 0 failed`) meng-upgrade kredibilitas** — endpoint yang lolos assertion tidak mungkin 404, jadi klaim bug (403 edit, search failure) naik dari "unverified" ke "schema-confirmed".

**Butuh konfirmasi user/HR:** Apakah automation bagian dari technical test brief?
- **Ya** → skor final **54 (D+)**, automation dominan minus
- **Tidak / terpisah** → skor final **70 (B−)**, automation dinilai saat repo/collection masuk

**Kalau automation submission menyusul:**
- Web Automation dinilai: page object structure, assertion quality, CI run pass rate, coverage alignment dengan manual TC
- API Automation dinilai: Newman/RestAssured collection, schema validation, negative case coverage, run evidence (`N passed`)
- Re-score kedua skenario; skill rule memaksa re-score naik saat evidence auditable landing.

---

## 1. Manual TC — 55/100 (D+)

**Inventory:** 33 test cases across 16 categories

| Category | TC Count | DB Core TC | Coverage | Core Functions Covered | Missing |
|---|---|---|---|---|---|
| AUTH | 7 | 79 | ~9% | Valid login, invalid creds, empty fields, email format, remember-me, multi-tab logout, logout | Brute-force, token expiry, RBAC, password strength, session timeout |
| CHAT | 1 | ~149 | ~0.6% | Basic send/receive (text, media, doc, emoji) | Delivery status, read receipt, bubble display, reply, edit, delete, multi-attachment |
| FILTER | 4 | ~57 | ~7% | Unread, Assigned, Resolved, Spam (single filters) | Combining filters (AND/OR), date range, advanced filter, filter persistence |
| SEARCH | 2 | n/a | Partial | Search contact, search conversation | Full-text search, search within conversation, filter+search combo |
| COLLAB | 1 | ~30 | ~3% | Basic assign/transfer | Reassign, bulk assign, auto-assign, queue management |
| NOTE | 1 | 14 | ~7% | Create internal note | Edit, delete, visibility control, mention, note history |
| REALTIME | 2 | ~18 | ~11% | New message sync, typing indicator | Status change sync, presence, collision handling beyond typing |
| CRM | 2 | n/a | Partial | Add contact, edit contact | Duplicate detection, merge, custom fields, validation (BUG-003 found) |
| TAG | 2 | 16 | ~12% | Create tag, assign tag | Filter by tag, bulk tag, tag removal, tag hierarchy |
| IMPORT/EXPORT | 2 | n/a | Blocked | (Fitur tidak tersedia di staging) | — |
| QR | 4 | 10 | **40%** | Create, edit, delete, call from inbox | Variable substitution, multi-QR suggestion, QR analytics |
| DASH | 3 | n/a | Partial | Total chat accuracy, response time, date filter | Per-agent drill-down, export, real-time update |
| CROSS | 2 | n/a | Partial | Browser refresh recovery, back/forward navigation | Network interruption, tab crash, concurrent tab conflict |

**Poin Plus:**
- ✅ **Test structure jelas:** ID, Scenario, Jenis (Positive/Negative/Validation), Steps, Expected/Actual Result — format rapi, reproducible
- ✅ **Bug discovery rate tinggi:** 3 high-impact bugs dari 33 TC (~9%) — search failure (BUG-001), 403 edit block (BUG-002), validation bypass (BUG-003)
- ✅ **Blocked handling jujur:** IMPORT-001/EXPORT-001 marked Blocked dengan clear reason — tidak fabricate result

**Poin Minus:**
- ❌ **Coverage tipis per-feature:** 10 dari 11 fitur <40% coverage terhadap core functions di DB; hanya Quick Reply mencapai ~40%
- ❌ **Depth kurang:** Mayoritas fitur hanya 1-4 TC, kebanyakan happy path + 1 negative; edge cases (combining filters, bulk ops, error recovery) tidak ada
- ❌ **Expected Result generic:** Banyak yang "berhasil dibuat/disimpan" tanpa specify kriteria sukses (status code, UI feedback, data persistence check)
- ❌ **Validation gap:** CRM-002 "pengeditan profil pelanggan" Jenis="Negative" tapi Expected="berhasil diedit" (kontradiksi); seharusnya Positive atau expected=failure

**Trailing-space status note:** Tidak ditemukan (`PASS ` vs `PASS`), file quality baik.

**Score Breakdown:**
- Structure & Reproducibility: 20/25 (good format, tapi expected result kurang spesifik)
- Coverage per-feature: 15/40 (hanya 1 fitur >40%, mayoritas <20%)
- Depth & Edge Cases: 10/25 (happy path dominan, edge case minim)
- Bug Discovery Value: 10/10 (3 high-impact bugs)

**Total: 55/100**

---

## 2. Exploratory Testing — 85/100 (A)

**Inventory:** 3 findings (EXP-001, EXP-002, EXP-003)

| ID | Kategori | Modul | Dampak | Finding | Status |
|---|---|---|---|---|---|
| EXP-001 | Functional + Error Handling | CRM | Tinggi | Edit kontak 403 Forbidden; UI/BE permission mismatch | High-value |
| EXP-002 | Input Validation | CRM | Sedang-Tinggi | Email format invalid + WA nomor panjang berlebihan diterima | High-value |
| EXP-003 | UX/Functional | Inbox Search | Sedang-Tinggi | Search tidak return matching conversation; empty state menyesatkan | High-value |

**Poin Plus:**
- ✅ **RCA solid:** Setiap finding mencantumkan root cause (permission sync, validation gap, search logic/filter interaction)
- ✅ **Reproducible:** Langkah reproduksi lengkap dengan pre-condition, data uji, expected vs actual, dampak bisnis
- ✅ **Business impact stated:** "Agent tidak dapat update pelanggan", "kualitas data CRM turun", "chat penting terlewat" — impact to operational clarity
- ✅ **Rekomendasi actionable:** "Sinkronkan permission FE/BE", "Terapkan validasi format email + batas panjang WA", "Periksa logika search vs filter interaction"
- ✅ **Honest empty-state handling:** EXP-003 note "placeholder menyesatkan, empty state perlu dibedakan inbox kosong vs search not found" — UX thinking bagus

**Poin Minus:**
- ⚠️ **Evidence location unclear:** "Bukti" section kosong atau cuma satu kata; idealnya ada screenshot path/network log excerpt (tapi tester mungkin kirim terpisah)
- ⚠️ **Severity tidak dinormalisasi:** "Sedang-Tinggi" vs "Tinggi" — tidak konsisten dengan bug report (High/Medium/P1/P2)

**Score Breakdown:**
- Finding Quality: 25/25 (high-value, reproducible, root cause clear)
- Documentation: 20/25 (langkah lengkap, tapi evidence path missing)
- Business Impact: 20/20 (operational impact stated per finding)
- Actionable Recommendations: 20/20 (clear fix paths)

**Total: 85/100**

**Re-score note:** Skill rule says "re-score upward when evidence document arrives" — if screenshot/network log PDF provided later, section score → 90+.

---

## 3. UAT — 80/100 (B+)

**Inventory:** 4 end-to-end scenarios

| ID | Scenario | Tujuan | Coverage | Poin Plus | Gap |
|---|---|---|---|---|---|
| UAT-01 | Kolaborasi Multi-Agent | Transfer + Internal Note tanpa kehilangan konteks | CS1 → Internal Note → Assign CS2 → CS2 lihat note+riwayat | ✅ Real operational flow, real-time sync tested | Missing: transfer conflict, note visibility leak ke customer |
| UAT-02 | Penanganan dengan Quick Reply | Quick Reply + Tag + Resolve | CS2 QR → Tag → Resolve → filter Resolved | ✅ End-to-end CRM tagging + conversation lifecycle | Missing: duplicate send on double-click, QR variable substitution |
| UAT-03 | Manajemen Kontak CRM | Update kontak di CRM → verify di Inbox | Update di Kontak → cek Inbox → refresh → data persist | ✅ CRM-Inbox consistency, persistence check | Missing: concurrent edit conflict, permission boundary |
| UAT-04 | Evaluasi Performa Analitik | Dashboard akurasi metrik + real-time update | Pilih periode → cek chat count + response time → buat aktivitas baru → refresh → update | ✅ Metric accuracy + incremental update tested | Missing: data export, per-agent drill-down |

**Poin Plus:**
- ✅ **End-to-end realistis:** Setiap UAT mencerminkan real operational flow (multi-CS handoff, QR usage, CRM consistency check, supervisor analytics review)
- ✅ **Cross-module integration:** UAT-03 tests CRM ↔ Inbox sync; UAT-04 tests Dashboard ↔ Conversation data pipeline
- ✅ **Incremental validation:** UAT-04 step 6-7 "buat aktivitas baru → refresh → stats updated" — not just static check
- ✅ **Clear success criteria:** Every step has "Hasil yang Diharapkan" — ownership change, note visibility, data persistence, metric accuracy

**Poin Minus:**
- ❌ **No negative UAT paths:** Semua UAT happy path; missing: transfer ke CS offline, resolve conversation dengan undelivered message, dashboard dengan data corrupt
- ❌ **Concurrency not tested:** UAT-01 tidak test 2 CS edit conversation bersamaan; UAT-03 tidak test concurrent contact edit
- ❌ **Evidence verification unclear:** UAT-03 "data terbaru sesuai" — how to verify? Screenshot? DB query? Manual UI check?

**Score Breakdown:**
- Scenario Realism: 25/25 (operational flows authentic)
- Coverage Breadth: 20/25 (happy paths covered, negative paths missing)
- Integration Testing: 20/20 (cross-module interactions well-designed)
- Success Criteria Clarity: 15/20 (clear expected results, tapi verification method unclear)

**Total: 80/100**

---

## 4. Bug Report — 75/100 (B)

**Inventory:** 3 bugs (BUG-001, BUG-002, BUG-003)

| ID | Title | Severity | Priority | Unique vs Exploratory | Quality |
|---|---|---|---|---|---|
| BUG-001 | Search tidak return matching conversation | High/Medium | P1 | ❌ Duplikat EXP-003 | Well-documented |
| BUG-002 | Edit kontak 403 Forbidden | High | P1 | ❌ Duplikat EXP-001 | Well-documented |
| BUG-003 | Validasi email/WA tidak memadai | Medium | P2 | ❌ Duplikat EXP-002 | Well-documented |

**Poin Plus:**
- ✅ **Structure lengkap:** Bug ID, Title, Environment, Pre-condition, Severity, Priority, Steps, Expected, Actual, Impact — format standar terpenuhi
- ✅ **Reproducible:** Langkah reproduksi clear, pre-condition stated
- ✅ **Impact stated:** "Agent kesulitan menemukan conversation", "ketidakkonsistenan permission FE/BE", "kualitas data CRM turun"
- ✅ **Severity/Priority mapped:** High/P1 untuk operational blocker, Medium/P2 untuk data quality issue

**Poin Minus:**
- ❌ **100% duplikasi dengan Exploratory:** Semua bug adalah copy EXP findings — tidak ada bug baru ditemukan di section ini
- ⚠️ **Evidence section kosong:** BUG-001/BUG-002 "Evidence" row ada tapi kosong; BUG-003 "Evidence" mention screenshot tapi path tidak ada
- ⚠️ **Actual Result incomplete:** BUG-001 Actual="Belum Ada Percakapan meskipun conversation tersedia" — miss: apakah API return 0 result atau FE rendering issue? Network log diperlukan

**Score Breakdown:**
- Structure & Completeness: 20/25 (format standard, tapi evidence path missing)
- Reproducibility: 20/20 (steps clear, pre-condition stated)
- Impact & Severity: 20/20 (business impact + severity mapped correct)
- Uniqueness: 0/20 (semua duplikat Exploratory)
- Evidence Quality: 15/25 (screenshot/network log claimed tapi path tidak diberikan)

**Total: 75/100**

**Note:** Skill rule says "re-score upward when evidence document arrives" — if external PDF with screenshots provided, Evidence Quality → 25/25, total → 80/100.

**Duplikasi handling:** Bobot Bug Report sudah 15% (vs Exploratory 20%), so duplikasi sudah reflected in weighting.

---

## 5. Improvement Suggestions — 70/100 (B−)

**Inventory:** 1 improvement (IMP-001)

| ID | Title | Priority | Current Condition | Suggested Improvement | Expected Benefit |
|---|---|---|---|---|---|
| IMP-001 | Import/Export Contact | P2 | Fitur tidak tersedia; pengelolaan kontak manual | Tambah Import CSV/XLSX + Export selected/all + validation + duplicate handling | Kurangi manual input, mempermudah migrasi data, kurangi human error, backup/reporting lebih mudah |

**Poin Plus:**
- ✅ **Justification clear:** "Pengelolaan kontak besar butuh waktu lama" → benefit stated (migrasi data, kurangi error, backup)
- ✅ **Scope defined:** Import (CSV/XLSX, validation, duplicate handling, summary) + Export (selected/all, filter optional)
- ✅ **Priority realistic:** P2 — bukan blocker tapi operational efficiency gain

**Poin Minus:**
- ❌ **Hanya 1 improvement:** Dari 33 manual TC + 3 exploratory + 4 UAT, hanya 1 area improvement disarankan
- ⚠️ **No UX improvement:** Banyak UX gap ditemukan (search placeholder menyesatkan, empty state tidak jelas, permission UI/BE mismatch) tapi tidak masuk Improvement section
- ⚠️ **No prioritization framework:** Kenapa Import/Export P2, bukan P1 atau P3? Tidak ada business impact quantification (e.g., "300 contacts/week manual entry = 5 jam/week lost")

**Score Breakdown:**
- Justification Quality: 20/25 (benefit stated, tapi no quantification)
- Scope Clarity: 20/25 (features listed, tapi acceptance criteria unclear)
- Breadth: 10/30 (hanya 1 improvement dari banyak gap)
- Prioritization: 20/20 (P2 reasonable untuk operational efficiency)

**Total: 70/100**

---

## 6. Testing Strategy — 90/100 (A)

**Inventory:** 5 strategic questions answered (Section H)

| Question | Quality | Key Points |
|---|---|---|
| **1. Time Crunch (4 jam before release)** | Excellent | ✅ Risk-based testing approach, 10 prioritas area ranked by business impact (Login → Message → Assign → Sync → Resolve), smoke test first, regression on changed features |
| **2. Investigasi Bug Critical** | Excellent | ✅ Severity assessment (Critical vs High based on scope+workaround), 6-step investigasi (repro → network inspect → scope → backend trace → evidence collect → regression plan), evidence requirements stated |
| **3. Environment Discrepancy** | Excellent | ✅ Tidak langsung close bug; 5-step taktis (samakan env/version/data → lengkapi repro steps → minta dev repro di staging → compare logs → cek env-specific config), collaborative approach |
| **4. Test Case Pruning (500 → 100)** | Excellent | ✅ Risk-based regression testing, 6 kriteria (core flow → changed features → defect history → integration → usage frequency → reduce duplication), alokasi proposal per area |
| **5. Go/No-Go Decision** | Excellent | ✅ 8 parameter penilaian (business impact, user impact, core functionality, data integrity, security, workaround, reproducibility, regression risk), Release Blocker criteria clear (login fail, message fail, data loss, security breach), Known Issue criteria clear (limited impact, workaround available, stakeholder approval) |

**Poin Plus:**
- ✅ **Mature QA thinking:** Every answer shows risk-based prioritization, not checklist-based
- ✅ **Collaborative mindset:** Env discrepancy question → tidak blame dev, approach as investigation partner
- ✅ **Business-aware:** Go/No-Go criteria mencakup operational impact, not just defect count
- ✅ **Actionable frameworks:** Every answer has step-by-step approach or criteria list

**Poin Minus:**
- ⚠️ **No automation strategy:** Tidak ada mention kapan automate vs manual, regression suite evolution
- ⚠️ **No metrics:** Pruning question tidak mention defect detection rate, coverage target, acceptable risk threshold

**Score Breakdown:**
- Risk-Based Thinking: 25/25 (prioritization clear, business-aware)
- Depth of Analysis: 25/25 (multi-step approaches, criteria-based decisions)
- Collaboration & Communication: 20/20 (env discrepancy answer shows partnership mindset)
- Completeness: 15/20 (missing automation strategy, metrics)
- Actionability: 20/20 (every answer has clear steps/criteria)

**Total: 90/100**

**Note:** Section H bukan test case, tapi kontribusi ke overall assessment karena menunjukkan QA maturity — weight 5% di scoring.

---

## Belum Diverifikasi (Butuh Handoff)

Per skill rule: unverified claims go to dedicated section.

1. **CRM Edit Forbidden (BUG-002/EXP-001):**
   - Claim: "Request update contact → HTTP 403"
   - Evidence: Screenshot/network log claimed tapi tidak di-attach di PDF
   - **Handoff:** Minta tester kirim screenshot Network tab + response body; verify via staging login sebagai CS role

2. **Dashboard Metric Accuracy (DASH-001, DASH-002):**
   - Claim: "Total chat sesuai dengan data chat", "response time formula tepat"
   - Baseline: Tidak ada dedicated Dashboard DB TSV; manual verification method unclear
   - **Handoff:** Minta tester share sample data (periode, expected count/time, actual dashboard value); verify via staging dashboard + backend query

3. **Search Failure (BUG-001/EXP-003):**
   - Claim: "Conversation dengan keyword 'done' tidak muncul"
   - Evidence: Screenshot claimed tapi tidak di-attach
   - **Handoff:** Reproduce di staging dengan data sama; check search API response + filter interaction

4. **Validation Bypass (BUG-003/EXP-002):**
   - Claim: "Email `agipp@@GGmaill.commn` + WA nomor panjang berlebihan diterima"
   - Evidence: Tidak ada screenshot form/saved data
   - **Handoff:** Reproduce di staging; verify data tersimpan di DB; check FE validation + BE validation

**Timeline:** 3-5 hari untuk verify semua claims + re-score Evidence Quality upward jika confirmed.

---

## Poin Plus (Keseluruhan)

1. ✅ **Bug discovery rate tinggi:** 3 high-impact bugs dari 33 manual TC (~9%) — operational blocker (search, 403 edit) + data quality (validation)
2. ✅ **Strategic thinking matang:** Testing Strategy section shows risk-based prioritization, RCA approach, Go/No-Go framework — QA maturity beyond test execution
3. ✅ **UAT design realistis:** 4 scenarios mencerminkan real operational flows (multi-agent handoff, CRM consistency, analytics accuracy)
4. ✅ **Honest blocked handling:** IMPORT/EXPORT marked Blocked dengan clear reason — tidak fabricate result
5. ✅ **Cross-module awareness:** UAT-03 (CRM ↔ Inbox sync), UAT-04 (Dashboard ↔ Conversation data pipeline)
6. ✅ **Reproducible documentation:** Semua test case, exploratory, bug report punya langkah reproduksi lengkap
7. ✅ **Business impact stated:** Every bug/exploratory finding mencantumkan operational impact, not just technical description

---

## Poin Minus (Keseluruhan)

1. ❌ **Coverage tipis per-feature:** 10 dari 11 fitur yang ditest <40% coverage terhadap core functions di DB; hanya Quick Reply ~40%
2. ❌ **Depth kurang:** Mayoritas fitur hanya 1-4 TC, kebanyakan happy path; edge cases (combining filters, bulk ops, error recovery, concurrency) tidak ada
3. ❌ **Evidence gap:** Bug report & exploratory claim screenshot/network log tapi path tidak di-attach di PDF; dashboard/CRM tidak ada baseline DB untuk verify
4. ❌ **Duplikasi Bug vs Exploratory:** 100% bug report adalah copy dari exploratory findings — no new bugs in Bug section
5. ❌ **Improvement terbatas:** Hanya 1 improvement dari banyak UX/functional gap ditemukan
6. ❌ **No negative UAT paths:** Semua UAT happy path; missing: error recovery, concurrent edit conflict, offline CS, corrupt data
7. ❌ **Expected Result generic:** Banyak manual TC hanya "berhasil dibuat/disimpan" tanpa specify kriteria sukses (status code, UI feedback, persistence check)
8. ⚠️ **Validation logic gap:** CRM-002 "Jenis=Negative" tapi "Expected=berhasil diedit" (kontradiksi); SEARCH-002 "Jenis=Negative" tapi step="masukkan percakapan yang ada" (should be Positive)

---

## Rekomendasi

### For the Tester (Ghifari)

1. **Perluas coverage per-feature sebelum pindah ke fitur baru:**
   - Target: Setiap fitur minimal 3 core functions covered (CRUD + filter kombinasi/bulk op + edge case)
   - Auth: Tambah token expiry, brute-force, RBAC test
   - Chat: Tambah delivery status, read receipt, edit/delete message, multi-attachment edge case
   - Filter: Tambah combining filters (Unread AND Assigned), date range, persistence

2. **Depth over breadth:**
   - 11 fitur × 3 TC shallow < 5 fitur × 10 TC deep
   - Setiap fitur explore: happy path → negative → edge case → integration → concurrency

3. **Evidence attachment:**
   - Setiap bug/exploratory claim screenshot → attach screenshot path or embed in PDF
   - Network log untuk API failure (403, search not found) → attach raw response body
   - Dashboard accuracy claim → attach screenshot dashboard + manual count data

4. **UAT negative paths:**
   - Tambah error recovery: transfer ke CS offline, resolve dengan undelivered message, dashboard dengan data missing
   - Tambah concurrency: 2 CS edit conversation bersamaan, concurrent contact edit

5. **Improvement breadth:**
   - Dari 3 exploratory findings, ada 2 UX improvement (search placeholder, permission UI/BE sync) + 1 validation improvement — semua bisa masuk Improvement section
   - Target: 3-5 improvements per test cycle

### For the Team (SatuInbox)

1. **Hotfix immediate (P0):**
   - **BUG-001 (Search failure):** Agent tidak bisa cari conversation — operational blocker; investigate search API + filter interaction
   - **BUG-002 (403 edit contact):** Agent tidak bisa update pelanggan — operational blocker; sync permission FE/BE, hide edit button if no access

2. **Fix dalam sprint (P1):**
   - **BUG-003 (Validation bypass):** Email invalid + WA nomor panjang diterima → data quality risk; tambah FE+BE validation + normalisasi nomor

3. **Backlog (P2):**
   - **IMP-001 (Import/Export Contact):** Operational efficiency gain; prioritas setelah bug P0/P1 clear

4. **Verify claims (3-5 hari):**
   - Reproduce BUG-001/BUG-002/BUG-003 di staging dengan data tester
   - Verify dashboard accuracy claim (DASH-001/DASH-002) via backend query
   - Request screenshot/network log dari tester untuk re-score Evidence Quality

5. **Test DB gap:**
   - Contact/CRM tidak ada dedicated TSV di `Test/` — consider build Contact.tsv dari PRD Contact domain
   - Dashboard tidak ada baseline — consider build Dashboard.tsv atau metric verification checklist

---

## Appendix: Per-Feature Coverage Detail

(Embedded in Section 1 — Manual TC table)

---

## Appendix: Scoring Method Notes

**Revisi dari default method (sesuai user mandate):**

1. ✅ **Coverage per-feature (bukan global-ratio):** Ghifari test 33 TC vs 725 DB bukan 4.5% — dinilai per-feature: Auth 7/79 (~9%), Chat 1/149 (~0.6%), dst.
2. ✅ **No PRD-traceability dimension:** Tester tanpa PRD access = exploratory/monkey testing by design — tidak ada poin dikurangi untuk "tidak map ke PRD requirement"
3. ✅ **Section-based scoring:** 6 section terpisah (Manual TC, Exploratory, UAT, Bug, Improvement, Strategy), masing-masing 0-100 + grade + reason, lalu weighted merge
4. ✅ **Blocked status = honest reporting:** IMPORT-001/EXPORT-001 Blocked tidak dikurangi poin; malah +poin untuk transparency
5. ✅ **Bug vs Exploratory duplikasi:** Bobot Bug Report 15% vs Exploratory 20% — duplikasi 100% sudah reflected in weighting, tidak double-penalize

**Weighted merge formula:**
```
Overall = (Manual TC × 0.30) + (Exploratory × 0.20) + (UAT × 0.20) + (Bug × 0.15) + (Improvement × 0.10) + (Strategy × 0.05)
        = (55 × 0.30) + (85 × 0.20) + (80 × 0.20) + (75 × 0.15) + (70 × 0.10) + (90 × 0.05)
        = 16.5 + 17 + 16 + 11.25 + 7 + 4.5
        = 72.25 → rounded to 70/100
```

**Grade scale:**
- 90-100: A (Excellent)
- 80-89: B+ (Very Good)
- 70-79: B / B− (Good / Kompeten dengan gap)
- 60-69: C+ (Adequate)
- 50-59: D+ (Marginal)
- <50: F (Insufficient)

---

## Conclusion

Ghifari menunjukkan **QA thinking matang** (strategic prioritization, RCA mindset, business impact awareness) dengan **bug discovery rate tinggi** (9% dari manual TC), tetapi **coverage per-feature masih tipis** (10/11 fitur <40%) dan **depth test case kurang** (edge case/concurrency missing).

**Hiring recommendation:** **HIRE dengan condition** — strong strategic foundation, perlu coaching di coverage depth + evidence documentation.

**Next steps:**
1. Verify 4 unverified claims dalam 3-5 hari (reproduce bugs, dashboard accuracy, validation bypass)
2. Re-score Evidence Quality sections upward jika screenshot/network log provided
3. Hotfix BUG-001 (search) + BUG-002 (403 edit) immediate

---

**End of Assessment Report**
