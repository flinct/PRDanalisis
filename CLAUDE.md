# CLAUDE.md — PRDanalisis Workspace Context

> File ini dibaca otomatis oleh Claude di setiap session baru.
> Workspace: `C:\Users\MyBook SAGA 12\Desktop\PRDanalisis`
> Project: **SatuInbox** — Omnichannel Customer Service Platform

---

## ⚡ Wajib Dilakukan Pertama Kali

Sebelum mengerjakan apapun, baca dan ikuti:

```
Rules/agent-instruction.md
```

File ini adalah **master workflow** — berisi: deteksi tipe tugas, **Phase 0 change intake & classification**, rule mana yang harus dimuat, cara muat konteks produk, dan cara eksekusi.

---

## Produk: SatuInbox

Customer service live chat platform dengan WhatsApp integration.

- **Domain utama:** Conversation, Ticket, WhatsApp Web, Broadcast, Contact
- **Source of Truth PRD:** V2 (Conversation V2, Ticket V2, WhatsApp Web V2)
- **Stack BE:** NestJS, gRPC, RabbitMQ, MongoDB, Socket.IO — monorepo Nx, 20 microservices
- **Stack FE:** Next.js, React 19, Zustand 5, TanStack Query 5, Tailwind CSS 4 — monorepo Turborepo

---

## Struktur Workspace

```
PRDanalisis/
├── CLAUDE.md                    ← file ini
├── Rules/                       ← semua rule files (wajib baca sesuai tipe tugas)
│   ├── agent-instruction.md     ← ENTRY POINT — baca ini pertama
│   ├── workflow-rule.md
│   ├── requirements-lifecycle-rule.md
│   ├── structure-rule.md
│   ├── summary-rule.md
│   ├── qa-analysis-rule.md
│   ├── impact-analysis-rule.md
│   ├── prd-writing-rule.md
│   ├── prd-comparison-rule.md
│   ├── test-case-rule.md
│   ├── automation-bridge-rule.md
│   ├── memory-routing-rule.md
│   ├── memory-write-rule.md
│   ├── memory-update-rule.md
│   ├── global-memory-write-rule.md
│   └── global-memory-update-rule.md
├── Memory/                      ← canonical product context, architecture refs, status summary, dan navigation index
│   ├── README.md                ← memory index — baca untuk navigasi
│   ├── global-memory.md         ← canonical product rules (always load)
│   ├── reference-index.md       ← pointer ke reusable PRD analysis references di `Assessments/reference/`
│   ├── CLAUDE-be.md             ← BE architecture reference
│   ├── CLAUDE-fe.md             ← FE architecture reference
│   ├── conversation-undeveloped-features-analysis.md
│   ├── comprehensive-undeveloped-features-analysis.md
│   ├── impact-linked-chat-bubble-patch.md
│   └── qa-tooling.md
├── PRD/                         ← source PRD files per domain
│   ├── Conversationv2/          ← SOURCE OF TRUTH (V1 deprecated)
│   ├── ticketv2/                ← SOURCE OF TRUTH (V1 deprecated)
│   ├── Whatsapp web v2/         ← SOURCE OF TRUTH (V1 deprecated)
│   ├── Broadcast/
│   └── Contact/
└── Assessments/                 ← assessment reports + reusable PRD analysis references
    ├── reference/              ← comparison, deep-dive, loophole map (non-decision-bearing)
    └── templates/
        └── Setup/              ← operational workflow templates (change intake, assessment, QA pre/post, reviewer, automation mapping)
```

---

## Canonical Product State (per 2026-06-10)

### Status V1 vs V2
- Conversation V1 (`PRD/Conversation/`) → **DEPRECATED**, gunakan V2
- Ticket V1 (`PRD/Ticket/`) → **DEPRECATED**, gunakan V2
- WhatsApp Web V1 (`PRD/Whatsapp web/`) → **DEPRECATED**, gunakan V2

### Fitur Belum Diimplementasi (BE + FE)
- Collaborator role, Snooze Conversation, Related Conversations
- Related Tickets & Merge, WA Group Mention, Auto-reply
- WA Import Modes, WA Anti-spam system, Room Reminder, Hold state

### Open Risk Kritis
- Hold/Snooze/SLA 3-way conflict masih open
- Conversation SLA reopen behavior masih undefined

---

## Quick Task → Rule Mapping

| Tipe Tugas | Rule Wajib |
|---|---|
| Requirement / Change Intake | `requirements-lifecycle-rule.md`, `impact-analysis-rule.md` (jika shared behavior / removal / blast radius besar) |
| PRD Analysis / Review | `qa-analysis-rule.md`, `impact-analysis-rule.md` |
| PRD Writing | `prd-writing-rule.md`, `qa-analysis-rule.md` |
| Test Case / QA / UAT | `test-case-rule.md`, `qa-analysis-rule.md` |
| Bug Fix | `qa-analysis-rule.md`, `impact-analysis-rule.md` |
| Impact Analysis | `impact-analysis-rule.md`, `qa-analysis-rule.md` |
| PRD Comparison | `prd-comparison-rule.md`, `qa-analysis-rule.md` |
| Memory Write/Update | `memory-routing-rule.md` + rule tulis/update sesuai target |

> Untuk semua tipe tugas, muat juga `summary-rule.md` dan pastikan file `summary/YYYY-MM-DD-judul-singkat.md` dibuat/diupdate selama session berjalan.

> Detail lengkap ada di `Rules/agent-instruction.md`.

---

## Memory Load Priority

1. **Selalu load:** `Memory/global-memory.md`
2. **Load jika butuh reusable PRD deep-dive / comparison:** `Memory/reference-index.md`
3. **Load jika menyentuh BE:** `Memory/CLAUDE-be.md`
4. **Load jika menyentuh FE:** `Memory/CLAUDE-fe.md`
5. **Load sesuai domain:** lihat `Memory/README.md` dan `Memory/reference-index.md` untuk navigasi

---

## Workflow Notes (Current Canonical)

- **Phase 0 — Change Intake & Classification** wajib dijalankan untuk request yang menambah, mengubah, membuang, atau merevive behavior / PRD lama sebelum draft PRD v0 atau Assessment Report dibuat.
- Untuk feature yang sudah punya brief, perubahan lanjutan harus **update Change Intake Brief dulu** sebelum patch PRD, Assessment Report, atau QA artifacts.
- Logical nama artefak analisa permanen adalah **Assessment Report**.
- Persisted filename saat ini masih boleh memakai suffix `-qa-assessment.md` untuk kompatibilitas struktur repo.
- **Analyst** adalah owner default untuk Assessment Report.
- **Reviewer Gate A / B / C** dan **Requirement Package Freeze** ada di `Rules/workflow-rule.md`.
- **QA output dipisah dua fase**:
  - pre-implementation: review PRD, regression impact, coverage/test strategy, automation candidate mapping
  - post-implementation: regression result, automation alignment, coverage confirmation, uncovered gap/defect note
- Template operasional workflow ada di `Assessments/templates/Setup/`, termasuk `change-intake-brief-template.md` untuk Phase 0.

---

## Orchestrator Mode (trigger: kata "orchestrator")

**Trigger:** kalau pesan user mengandung kata **`orchestrator`** (di mana saja), aktifkan mode ini untuk task tersebut. Tanpa kata itu → kerja normal (single-agent).

**Peran:**
- **Main agent = orchestrator.** Semua kendali di sini: spawn worker, terima hasil, spawn reviewer, jalankan loop, putuskan stop. Subagent TIDAK saling bicara langsung — semua transit lewat orchestrator.
- **Subagent = `leaf`** (via `delegate_task`). Worker mengerjakan; reviewer menilai. Model per-subagent ditentukan oleh `kind` → `delegation.role_models` (lihat tabel di bawah); tanpa `kind` inherit `combo1`.

**Alur loop (worker → review → revise):**
1. **Delegate worker** — beri goal + konteks lengkap (subagent tidak tahu isi chat ini). Task tipikal: analisa, research/deep-research, atau coding. **Wajib set `kind`** biar subagent pakai model yang tepat (lihat tabel di bawah).
2. **Delegate reviewer** (`kind: "review"` / `"code-review"` / `"qa"`) — kirim output worker + kriteria. Reviewer WAJIB akhiri dengan verdict eksplisit: `PASS` atau `NEEDS_REVISION: <daftar hal yang harus diperbaiki>`.
3. **Jika `NEEDS_REVISION`** → delegate worker lagi dengan feedback reviewer, lalu ulang dari langkah 2.
4. **Jika `PASS`** → selesai, laporkan hasil final ke user.

**Model per task (`delegate_task(kind=...)` → `delegation.role_models`):**

| Task | `kind` | Model (via ninerouter) |
|---|---|---|
| Coding fitur/bugfix | `coding` | `openai/gpt-5.5` |
| Nulis kode mekanis/boilerplate | `code-writing` | `cmc/deepseek/deepseek-v4-flash` |
| Review kode | `code-review` | `openai/gpt-5.5` |
| Review umum (PRD/analisa) | `review` | `openai/gpt-5.5` |
| Analisa / deep-research | `analysis` | `openai/o3-pro` |
| Debugging | `debugging` | `openai/gpt-5.5` |
| Planning | `planning` | `cc/claude-opus-4-8` |
| Arsitektur | `architecture` | `cc/claude-opus-4-8` |
| Test case / QA | `qa` / `test-generation` | `openai/gpt-5.5` / `cc/claude-sonnet-5` |

Daftar lengkap ada di `delegation.role_models` (config.yaml). `kind` tidak diisi → subagent inherit `combo1`. Provider selalu ninerouter (semua model lewat proxy yang sama).

**Rem (wajib, biar tidak loop selamanya):**
- Maksimal **3 putaran revisi**. Kalau putaran ke-3 masih `NEEDS_REVISION` → STOP, laporkan ke user output terbaik + sisa isu yang belum beres. Jangan lanjut sendiri.
- Reviewer & worker = subagent terpisah tiap putaran (konteks bersih).
- Task sepele (baca 1 file, tanya singkat, ubah 1 baris) → JANGAN pakai loop meski ada kata "orchestrator"; kerjakan langsung.

**Batas teknis:** `delegation.max_concurrent_children: 3`, `max_spawn_depth: 1` (subagent tidak bisa delegate lagi — loop harus dijalankan orchestrator, bukan didelegasikan turun).

---

## ⚡ Baca Juga

Setelah baca file ini, lihat **`WORKFLOW_CONTEXT.md`** — dokumen onboarding lengkap yang mencakup:
- Arsitektur 3-repo (PRDanalisis ↔ sixV2Automation ↔ omnichannel-satuinbox-fe)
- Automation bridge pipeline detail (Conversation.tsv → JSON → Playwright specs)
- Multi-agent workflow: Assessment Report, Reviewer Gates, Requirement Package Freeze, QA pre/post implementation
- Environment & accounts (dev test accounts, env vars)
- Page Objects index lengkap (18 page objects dari sixV2Automation)
- Commands cheatsheet untuk 3 repo

## Aturan Kritis

1. Tidak ada tugas dikerjakan tanpa baca rule yang sesuai terlebih dahulu
2. `Rules/agent-instruction.md` adalah source of truth untuk workflow
3. `Memory/global-memory.md` adalah source of truth untuk canonical product rules
4. Setiap session wajib punya file summary aktif di `summary/` sesuai `Rules/summary-rule.md`
5. Hasil analisa decision-bearing dipermanenkan di `Assessments/` sebagai **Assessment Report**
6. Jangan overwrite memory — update section relevan saja
7. Jika ada konflik antara input user dan rule, **ikuti rule**
