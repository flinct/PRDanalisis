# WORKFLOW CONTEXT — BRD → PRD → Testcase → Automation Script

> **File ini = konteks kerja permanen.** Baca di awal setiap session baru (termasuk di PC lain) agar agent langsung paham struktur, rules, dan alur kerja tanpa perlu eksplorasi ulang.

---

## 1. ARSITEKTUR REPOSITORI (3 Repo Terkait)

| Repo | Path | Peran |
|------|------|-------|
| **PRDanalisis** | `C:\Users\MyBook SAGA 12\Desktop\PRDanalisis` | **Source of Truth** — BRD, PRD V2, Test Cases (TSV), Rules, Memory, Analysis |
| **sixV2Automation** | `C:\Users\MyBook SAGA 12\Desktop\sixV2Automation` | **Target Automation** — Playwright E2E specs, Page Objects, Config, RBAC memory |
| **omnichannel-satuinbox-fe** | `C:\Users\MyBook SAGA 12\Desktop\FE satuinbox\omnichannel-satuinbox-fe` | **FE Reference** — Component tree, Selectors, API services, State management, Types |

---

## 2. ALUR KERJA UTAMA (WORKFLOW)

```
BRD (Business Requirement Document)
    │
    ▼
PRD V2 Writing (Conversationv2/, ticketv2/, Whatsapp web v2/)
    │   - Mengikuti Rules/prd-writing-rule.md (Lite/Standard/Full/Patch)
    │   - Referensi: Memory/global-memory.md (canonical rules)
    │   - Referensi: Memory/CLAUDE-be.md, CLAUDE-fe.md (implementasi existing)
    │
    ▼
PRD Analysis (QA Assessment)
    │   - Mengikuti Rules/qa-analysis-rule.md (3 tipe: Feature Dev, Bug Fix, Interconnection)
    │   - Output permanen: `Assessments/<domain>/<feature-slug>/<feature-slug>-qa-assessment.md`
    │   - Versioning: versi sebelumnya dipindah ke `versions/` + ringkasan perubahan analisa wajib diisi
    │   - Output: Decision Summary, Requirement Summary, Flow Analysis, Impact Analysis
    │   - Output: Risk Matrix, Test Strategy, Production Safety, Traceability Matrix
    │
    ▼
Decision
    │
    ▼
Test Case Writing (Manual TSV + Automation Mapping)
    │   - Mengikuti Rules/test-case-rule.md
    │   - Format: SatuInbox Test Case Scenario V2 (Conversation.tsv)
    │   - Coverage: 100% FR, EH, EC, State, RBAC, API, Migration, NFR
    │   - Bridge: Rules/automation-bridge-rule.md
    │
    ▼
Automation Script Generation (Playwright)
    │   - Source: Test/conversation/Conversation.tsv → parsed JSON
    │   - Target: sixV2Automation/playwright/tests/e2e/conversation/
    │   - Specs: convo-list-overview, convo-room, convo-detail-panel, convo-nav, convo-list-features, convo-supplement
    │   - Conventions: sixV2Automation/AGENTS.md
    │
    ▼
Execution & Maintenance
    │   - Run: npm run pw:test (sixV2Automation)
    │   - Sync: PRDanalisis → sixV2Automation via automation-bridge-rule.md
    │   - Update: AGENTS.md setiap kali test/page object baru
```

---

## 3. FILE KUNCI WAJIB BACA (SETIAP TUGAS)

### **Entry Point & Orchestration**
```
PRDanalisis/Rules/agent-instruction.md        ← ENTRY POINT: deteksi tipe tugas → load rule sesuai
PRDanalisis/Rules/workflow-rule.md            ← Urutan eksekusi: Rule → Global Memory → Feature Memory → Execute
PRDanalisis/Rules/structure-rule.md           ← Lokasi file: PRD/, Assessments/, Scripts/, Test/, Rules/, Memory/
PRDanalisis/Memory/README.md                  ← Index memory files, routing guide, deprecated notices
PRDanalisis/Assessments/templates/qa-assessment-report-template.md ← Template assessment permanen
```

### **PRD Writing & Analysis**
```
PRDanalisis/Rules/prd-writing-rule.md         ← Template PRD (Lite/Standard/Full/Patch), Quality Gate
PRDanalisis/Rules/qa-analysis-rule.md         ← WAJIB. Metodologi analisa QA senior (3 tipe, 9 impact dimensions)
PRDanalisis/Rules/impact-analysis-rule.md     ← Blast radius detection untuk setiap perubahan
PRDanalisis/Rules/prd-comparison-rule.md      ← Compare PRD A vs PRD B
```

### **Test Case & Automation Bridge**
```
PRDanalisis/Rules/test-case-rule.md           ← Test writing, coverage, TSV format, execution runbook
PRDanalisis/Rules/automation-bridge-rule.md   ← Kontrak sync PRDanalisis ↔ sixV2Automation
sixV2Automation/AGENTS.md                     ← Page objects, test inventory, config, RBAC, conventions
sixV2Automation/memory/rbac-memory.md         ← RBAC matrix untuk test (role, permission, visibility)
```

### **Memory & Context**
```
PRDanalisis/Memory/global-memory.md           ← Canonical product rules (Conversation, Ticket, WA Web, SLA, RBAC, Open Risks)
PRDanalisis/Memory/CLAUDE-be.md               ← BE Architecture: NestJS, 20 microservices, gRPC, RabbitMQ, MongoDB per service
PRDanalisis/Memory/CLAUDE-fe.md               ← FE Architecture: Next.js 16, Turborepo, Zustand, React Query, Socket.IO
PRDanalisis/Memory/conversation-prd-cross-analysis.md
PRDanalisis/Memory/conversation-sla-rlt-frt-ttc-analysis.md
PRDanalisis/Memory/conversation-undeveloped-features-analysis.md
PRDanalisis/Memory/comprehensive-undeveloped-features-analysis.md
... (file analysis lain di Memory/)
```

---

## 4. SOURCE OF TRUTH PER DOMAIN

| Domain | Source of Truth (V2) | Deprecated (V1) |
|--------|---------------------|-----------------|
| **Conversation** | `PRD/Conversationv2/` | `PRD/Conversation/` |
| **Ticket** | `PRD/ticketv2/` | `PRD/Ticket/` |
| **WhatsApp Web** | `PRD/Whatsapp web v2/` | `PRD/Whatsapp web/` |
| **SLA Conversation & Ticket** | `PRD/SLA conversation n ticket/` | — |
| **Test Cases** | `Test/conversation/Conversation.tsv` | — |

> **Rule:** Selalu gunakan V2. V1 hanya untuk referensi historis (lihat comparison files di Memory/).

---

## 5. MEMORY ROUTING (SIMPAN KE MANA)

| Jenis Knowledge | Simpan ke | Aturan |
|-----------------|-----------|--------|
| **System-wide, reusable, stable** | `Memory/global-memory.md` | Canonical rules, shared lifecycle, RBAC, architecture constraints, cross-feature dependencies |
| **Feature-specific, loophole, deep dive** | `Memory/<feature>-analysis.md` | PRD cross-analysis, QA reasoning, impact analysis, gap analysis |
| **JANGAN persist** | — | Generated test cases, raw PRD text, verbose narrative, temporary assumptions, implementation noise |

**Conflict handling:** Kalau rule baru kontrab global memory → FLAG inconsistency, jangan overwrite otomatis, minta klarifikasi.

---

## 6. AUTOMATION BRIDGE PIPELINE (DETAIL)

### **Source Files (PRDanalisis)**
```
Test/conversation/
├── Conversation.tsv                    ← MAIN: Manual test cases (SatuInbox Test Case Scenario V2)
├── Conversation_gap_supplement.tsv     ← SUPPLEMENT: Gap coverage temporary
├── conversation_tests_parsed.json      ← PARSED: Machine-readable full test cases
├── conversation_tests_summary.json     ← SUMMARY: Lightweight automation input
```

### **Generated Files (sixV2Automation)**
```
playwright/support/config/
├── conversation-testcases.generated.json   ← Sync payload consumed by automation
├── conversation-testcases.generated.js     ← CommonJS export of sync payload
```

### **Playwright Specs (Target Buckets)**
```
playwright/tests/e2e/conversation/
├── convo-list-overview.spec.js      ← TC 001-031: Chat list UI, icons, indicators, ellipsis
├── convo-room.spec.js               ← TC 032-315: Room, message input, bubbles, media, delivery, typing
├── convo-detail-panel.spec.js       ← TC 316-482: Detail panel, all accordion groups
├── convo-nav.spec.js                ← TC 483-545, 688-698: Navigation (inbox/unassigned/all/starred/spam/group/channel/team/junk)
├── convo-list-features.spec.js      ← TC 546-663: List title, status filter, read/unread, sort, advance filter, combining filter, item behavior
├── convo-supplement.spec.js         ← TC 664-713: Gap supplement (Chat List, Room, Get New Conv, Group Handling)
```

### **Sync Trigger (Otomatis di agent)**
```
WHEN Conversation.tsv changes:
  1. Re-run parsing/generation scripts (`Scripts/analysis/`)
  2. Refresh automation input JSON
  3. Regenerate/patch Playwright specs in sixV2Automation
  4. Update sixV2Automation/AGENTS.md (test counts, page objects, conventions)
```

---

## 7. RULES UNTUK SETIAP TIPE TUGAS

### **PRD Writing (buat/tulis/draft PRD)**
1. Baca `prd-writing-rule.md` + `global-memory.md` + V2 PRD existing
2. Klasifikasikan kompleksitas: Lite / Standard / Full / Patch
3. Tentukan Phase 1 In Scope & Out of Scope DULU
4. Tulis sesuai template (metadata, overview, user stories, FR, EH, EC, UI, Field, NFR, dll)
5. Quality Gate Checklist sebelum finalisasi

### **PRD Analysis / Feature Dev Analysis**
1. Baca `qa-analysis-rule.md` (Type 1: Feature Development Analysis)
2. Baca `impact-analysis-rule.md` (blast radius)
3. Baca `global-memory.md` + feature memory relevan
4. Gunakan template `Assessments/templates/qa-assessment-report-template.md`
5. Output permanen: `Assessments/<domain>/<feature-slug>/<feature-slug>-qa-assessment.md`
6. Simpan versi sebelumnya ke `versions/` jika analisa direvisi, lalu isi ringkasan perubahan analisa
7. Isi minimal: Overview, Decision Summary, Requirement Summary, Flow Analysis, Impact Analysis, Dependency Matrix, Risk Matrix, Test Strategy, Production Safety, Traceability Matrix

### **Bug Fix Analysis**
1. Baca `qa-analysis-rule.md` (Type 2: Bug Fix Analysis)
2. Baca `impact-analysis-rule.md`
3. Identifikasi root cause, scope, regression risk, production safety
4. Output: Root Cause, Affected Modules, Data Integrity Risk, Regression Scope, Backward Compatibility, Validation Strategy, Rollback Test Scope

### **Test Case Writing (buat test case / test scenario / QA test)**
1. Baca `test-case-rule.md` + `qa-analysis-rule.md` (Test Specification Layer)
2. Baca PRD analysis output + impact analysis
3. Baca existing test cases di scope terkait
4. Output: Test Plan / Test Scenario List / Detailed Test Case Spec / Regression Suite / UAT Script
5. Format TSV: gunakan Manual TSV Output Mode di `test-case-rule.md` (SatuInbox Test Case Scenario V2)

### **Impact Analysis**
1. Baca `impact-analysis-rule.md` + PRD analysis output
2. Evaluasi 10 dimensi: Module, DB, API, UI/UX, Security, Performance, Integration, Reporting, Financial, Concurrency
3. Output format: Direct/Indirect Modules, DB Impact, API Contract, Frontend Impact, Automation Testing Impact, Security/RBAC, Performance Risks, Concurrency Risks, Regression Scope, Migration Risks

### **Memory Write / Update**
1. Baca `memory-routing-rule.md` → tentukan global vs feature
2. Baca existing memory (global + feature)
3. Global: `global-memory-write-rule.md` / `global-memory-update-rule.md`
4. Feature: `memory-write-rule.md` / `memory-update-rule.md`
5. Output format: Added / Updated / Removed / Conflicting / Final Merged

---

## 8. CONVENTIONS & NAMING

### **Test ID Format**
```
SIX-<MODULE>-<NNN>
Contoh: SIX-AUTH-001, SIX-TICKET-001, SIX-CONVO-001
```

### **PRD Requirement IDs**
```
FR-001, FR-002...     Functional Requirements
EH-001, EH-002...     Error Handling
EC-001, EC-002...     Edge Cases
NFR-001...            Non-Functional Requirements
US-001...             User Stories
PS-001...             Problem Statements
```

### **Priority Definitions**
```
P0: Release blocker, critical path, data integrity, security, SLA, payment, message delivery
P1: Core behavior, high-value regression
P2: Edge cases, lower-frequency paths, resilience, usability
P3: Nice-to-have, exploratory, cosmetic
```

### **Severity Definitions**
```
Critical: Data loss, financial loss, security breach, core flow broken for ALL users
High: Major feature broken, limited workaround, significant segment affected
Medium: Minor feature broken, acceptable workaround
Low: Cosmetic, non-functional, no user-facing impact
```

### **Status Vocabulary (TSV)**
```
Passed, Failed, Need to Test, On Test, No Status
(Header summary: PASSED, FAILED, NEED TO TEST, ON TEST)
```

### **TSV Field Order (WAJIB)**
```
Test ID → Create at → created by → Tester → Scenario → Pre-Condition → DATE → Url → Description → ENV → Steps → test type → Status Response → Expected Result → Actual Result → Status
```

---

## 9. ENVIRONMENT & ACCOUNTS (sixV2Automation)

### **Environments**
```
Default: dev (ENV=dev)
Override: ENV=prod npx playwright test
Config: playwright/support/config/environments.js (local/dev/staging/prod + apiBase)
```

### **Test Accounts (Dev)**
| Login | Password Env Var | Role |
|-------|------------------|------|
| `E2E_DEV_ADMIN_USER` | `E2E_DEV_ADMIN_PASSWORD` | admin (DEFAULT) |
| `E2E_DEV_SUPERVISOR_USER` | `E2E_DEV_SUPERVISOR_PASSWORD` | supervisor |
| `E2E_DEV_AGENT_USER` | `E2E_DEV_AGENT_PASSWORD` | agent |

### **Login Methods**
```javascript
// Positive test (beforeEach)
await authPage.loginWithCredentials(credentials, { useV2: true })

// Negative test
await authPage.login(identifier, password, { useV2: true, expectSuccess: false })
```

### **Key Selectors (Locale-Aware)**
```javascript
// Nav buttons
/Kotak Pesan Anda|Your Inbox/i
/Belum Ditugaskan|Unassigned/i
/Semua|All/i

// Actions
/Kirim|Send/i (force: true)
/Tutup|Close/i
/Buka|Reopen/i

// Chat room
#conversation-chatroom-container
textarea[data-cy="autogrowing-textarea"]
```

---

## 10. PAGE OBJECTS INDEX (sixV2Automation)

| File | Class | Coverage |
|------|-------|----------|
| `auth.page.js` | AuthPage | Login, register, logout, onboarding |
| `inbox.page.js` | InboxPage | Nav (ID/EN), channels, chat list, send msg, bubbles, SLA |
| `conversation-detail.page.js` | ConversationDetailPage | Detail panel, FRT/TTC/RLT labels |
| `conversation-history.page.js` | ConversationHistoryPage | History section in detail panel |
| `conversation-socket.page.js` | ConversationSocketPage | Socket.io connect/disconnect |
| `dashboard.page.js` | DashboardPage | Statistics page |
| `ticketing.page.js` | TicketingPage | Ticket list, create, tabs |
| `broadcast.page.js` | BroadcastPage | Broadcast dashboard |
| `contact.page.js` | ContactPage | Contact search/list |
| `group.page.js` | GroupPage | Group chat |
| `team.page.js` | TeamPage | Team settings |
| `check-all.page.js` | CheckAllPage | Cross-page nav smoke |
| `user-rbac.page.js` | UserRbacPage | RBAC access validation |
| `live-chat.page.js` | LiveChatPage | Widget live chat |
| `account-whatsapp.page.js` | AccountWhatsappPage | WhatsApp account monitoring |
| `endpoint-detect.page.js` | EndpointDetectPage | API route capture utility |
| `ticket-linked-bubble.page.js` | TicketLinkedBubblePage | Linked bubble (append, remove, nav, sync) |
| `member.page.js` | MemberPage | Member list, toggle active/deactive |

**Register di `playwright/support/pages/index.js`** — semua class diekspor di sini.

---

## 11. SLA METRICS (CANONICAL - dari global-memory.md)

### **Event Timestamps**
| Event | Field | Keterangan |
|-------|-------|------------|
| T1 — First Customer Inbound | `firstCustomerMessageAt` | First customer message inbound |
| T2 — First Agent Assignment | `firstAgentAssignmentAt` | First time conversation assigned to agent |
| T3 — First Agent Reply | `firstAgentReplyAt` | First customer-facing agent reply |
| T4 — Conversation Close | `conversationClosedAt` | Conversation resolved/closed |

### **Metric Formulas**
```
Wait Time = working_duration(T1, T2)     → wall-clock (no office hours)
RLT       = working_duration(T2, T3)     → office-hours-aware
FRT       = working_duration(T1, T3)     → wall-clock (no office hours)
TTC       = working_duration(T1, T4)     → office-hours-aware (depending on SLA mode)
```

**Constraint wajib:** `FRT = Wait Time + RLT` — harus selalu terpenuhi.

### **Business Hours Behavior**
| Metric | Office Hours | Pause Behavior |
|--------|-------------|----------------|
| FRT | Wall-clock (no pause) | Hanya AUX pause jika policy enabled. Waiting on Customer tidak pause FRT. |
| TTC | Office-hours-aware | Waiting on Customer pause TTC. AUX pause jika policy enabled. |
| RLT | Office-hours-aware | AUX/Snooze/Hold pause tergantung policy final (belum di-lock). |
| Wait Time | Wall-clock (no pause) | Tidak pernah pause. |

### **SLA Mode (BELUM FINAL)**
- **Agent-Centric (pause/resume):** TTC pause setelah agent reply, resume saat customer reply berikutnya.
- **Customer-Centric (continuous):** TTC continuous running T1 hingga T4 tanpa pause.

---

## 12. OPEN RISKS & KNOWN GAPS (dari global-memory.md)

| Risk | Status |
|------|--------|
| Hold vs Snooze vs SLA pause — 3-way conflict | **Unresolved** (Room v1.1: Hold pause SLA; Snooze v1.0: No SLA pause changes) |
| Reopen behavior — 3 definisi berbeda | **Unresolved** (Chat Sessions=new session, Room=reopen, Reassign=modal) |
| SLA color threshold mismatch (FE absolute vs V2 percentage) | **Mismatch** — perlu sinkronisasi |
| Group chat FRT disembunyikan di FE | **Gap** — V2 expects FRT visible for all channels |
| RLT & Wait Time Phase 1 | Reporting only, no alert/breach/threshold |
| FRT formula start (inbound vs assignment) | **Belum di-lock** — perlu konfirmasi PM |
| SLA mode (Agent-Centric vs Customer-Centric) | **Belum final** |
| Linked ticket metric inheritance (multiple conv → multiple tickets) | **Undefined** |

### **Undeveloped Features (FE + BE sama-sama 0%)**
| Conversation V2 | Ticket V2 | WhatsApp Web V2 |
|----------------|-----------|-----------------|
| Collaborator role | Related Tickets & Merge | Import Modes |
| Snooze Conversation | | Broadcast Humanization |
| Related Conversations | | Warming System |
| Multi-ticket draft from bubble | | Account Pools Rotation |
| WA Group Mention | | Bulk Scan Popup |
| Room Reminder | | Pairing Code, Public Links, Name Dropdown |
| Hold/Resume di header | | |
| Collections (repeatable custom attrs) | | |

---

## 13. AGENT WORKFLOW CHECKLIST (SETIAP TUGAS)

```
[ ] 1. Baca Rules/agent-instruction.md → deteksi tipe tugas
[ ] 2. Load rule WAJIB berdasarkan tipe tugas (workflow-rule.md, structure-rule.md, Memory/README.md + rule spesifik)
[ ] 3. Baca Memory/global-memory.md
[ ] 4. Baca feature memory relevan (Memory/CLAUDE-be.md, CLAUDE-fe.md, file analysis)
[ ] 5. Eksekusi pakai rule sebagai metodologi (bukan referensi pasif)
[ ] 6. Self-triggered actions: simpan ke memory, update bridge, regenerate specs, dll
[ ] 7. Output sesuai format rule yang berlaku
[ ] 8. Update AGENTS.md (sixV2Automation) kalau buat test/page object baru
```

---

## 14. COMMANDS BERGUNA

### **PRDanalisis (Working Dir)**
```bash
# Navigasi
cd "C:\Users\MyBook SAGA 12\Desktop\PRDanalisis"

# Search file/content
# Gunakan search_files tool (ripgrep) bukan grep/ls
```

### **sixV2Automation**
```bash
cd "C:\Users\MyBook SAGA 12\Desktop\sixV2Automation"

npm run pw:test              # All tests
npm run pw:test:chrome       # Chromium only
npm run pw:report            # HTML report
ENV=prod npx playwright test # Run on prod
LOGIN_TYPE=xxx npx playwright test  # Specific account
```

### **omnichannel-satuinbox-fe**
```bash
cd "C:\Users\MyBook SAGA 12\Desktop\FE satuinbox\omnichannel-satuinbox-fe"

npm run dev                  # All apps via Turborepo
npx turbo run dev --filter=omnichannel
npx turbo run dev --filter=widget
npm run build                # Production build
```

---

## 15. CATATAN UNTUK PC LAIN

1. **Clone 3 repo** ke path yang sama (atau update path di file ini)
2. **Baca file ini (WORKFLOW_CONTEXT.md)** di awal session
3. **Jalankan agent** → agent akan load rules dari `PRDanalisis/Rules/` dan memory dari `PRDanalisis/Memory/`
4. **Tidak perlu setup memory manual** — rules & memory sudah di file system, agent baca langsung
5. **Jika path beda** → update path di section 1 (Arsitektur Repositori)

---

## 16. VERSION & MAINTENANCE

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-09 | Initial creation - full workflow context documented |

**Update file ini saat:**
- Repo structure berubah
- Rule baru ditambah / rule existing di-update signifikan
- Memory canonical berubah (global-memory.md update major)
- Automation bridge pipeline berubah
- Page object / test convention berubah (update AGENTS.md juga)

---

> **END OF WORKFLOW CONTEXT**
>
> Agent: Baca file ini di awal session. Ikuti checklist di Section 13. Gunakan Section 3-12 sebagai referensi cepat.