# AGENTS.md — PRDanalisis Workspace Context

> File ini dibaca otomatis oleh Codex di setiap session baru.
> Workspace: `C:\Users\MyBook SAGA 12\Desktop\PRDanalisis`
> Project: **SatuInbox** — Omnichannel Customer Service Platform

---

## ⚡ Wajib Dilakukan Pertama Kali

Sebelum mengerjakan apapun, baca dan ikuti:

```
Rules/core/task-router.md          ← ENTRY POINT — deteksi tipe tugas + precedence
Rules/profiles/satuinbox.yml       ← governance strict (non-bypassable controls)
```

Kedua file ini adalah **master workflow** — berisi: deteksi tipe tugas, **Phase 0 change intake & classification**, rule core/adapter mana yang harus dimuat, cara muat konteks produk, dan cara eksekusi.

> Struktur rule sekarang modular: `Rules/core/` (universal) + `Rules/profiles/` (governance proyek) + `Rules/integrations/` + `Rules/formats/`. File lama di `Rules/` ber-banner **SUPERSEDED** (redirect) — baca `Rules/MIGRATION.md` untuk peta migrasi.

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
├── AGENTS.md                    ← file ini
├── Rules/                       ← rule files (core universal + profile + adapter)
│   ├── core/                    ← 7 rule universal (baca sesuai tipe tugas)
│   │   ├── task-router.md       ← ENTRY POINT — baca ini pertama
│   │   ├── change-management.md ← Phase 0 change intake & classification
│   │   ├── requirements.md      ← PRD writing
│   │   ├── analysis-and-risk.md ← QA analysis + impact analysis
│   │   ├── test-design.md       ← test case / QA / UAT
│   │   ├── knowledge-management.md ← memory routing + write/update
│   │   └── artifact-governance.md  ← versioning, naming, transcript
│   ├── profiles/
│   │   └── satuinbox.yml        ← governance strict SatuInbox (non-bypassable)
│   ├── integrations/
│   │   ├── satuinbox-playwright-bridge.md
│   │   └── satuinbox-openproject-adapter.md
│   ├── formats/
│   │   └── satuinbox-manual-tsv.md
│   ├── MIGRATION.md             ← peta migrasi + runbook
│   ├── validate-rules-pack.py   ← validator 3-profile
│   └── *.md                     ← 20 file lama (SUPERSEDED redirect)
├── Memory/                      ← canonical product context, architecture refs, status summary, dan navigation index
│   ├── README.md                ← memory index — baca untuk navigasi
│   ├── global-memory.md         ← canonical product rules (always load)
│   ├── reference-index.md       ← pointer ke reusable PRD analysis references di `Assessments/reference/`
│   ├── Codex-be.md             ← BE architecture reference
│   ├── Codex-fe.md             ← FE architecture reference
│   ├── Codex-mobile.md         ← Mobile app architecture reference
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
| Requirement / Change Intake | `core/change-management.md`, `core/analysis-and-risk.md` (jika shared behavior / removal / blast radius besar) |
| PRD Analysis / Review | `core/analysis-and-risk.md` |
| PRD Writing | `core/requirements.md`, `core/analysis-and-risk.md` |
| Test Case / QA / UAT | `core/test-design.md`, `core/analysis-and-risk.md` |
| Bug Fix | `core/analysis-and-risk.md` |
| Impact Analysis | `core/analysis-and-risk.md` |
| PRD Comparison | `core/analysis-and-risk.md` |
| Memory Write/Update | `core/knowledge-management.md` |
| Prototype / UI Mockup | `profiles/satuinbox.yml` — output ke `prototypes/` |
| Release Notes / Changelog | `integrations/satuinbox-openproject-adapter.md` — output ke `Release notes/` |

> Untuk semua tipe tugas, baca juga `profiles/satuinbox.yml` (governance strict) dan pastikan file `summary/YYYY-MM-DD-judul-singkat.md` dibuat/diupdate selama session berjalan (sesuai `core/artifact-governance.md`).

> Detail lengkap ada di `Rules/core/task-router.md`.

---

## Memory Load Priority

1. **Selalu load:** `Memory/global-memory.md`
2. **Load jika butuh reusable PRD deep-dive / comparison:** `Memory/reference-index.md`
3. **Load jika menyentuh BE:** `Memory/Codex-be.md`
4. **Load jika menyentuh FE:** `Memory/Codex-fe.md`
5. **Load jika menyentuh Mobile:** `Memory/Codex-mobile.md`
6. **Load sesuai domain:** lihat `Memory/README.md` dan `Memory/reference-index.md` untuk navigasi

---

## Workflow Notes (Current Canonical)

- **Phase 0 — Change Intake & Classification** wajib dijalankan untuk request yang menambah, mengubah, membuang, atau merevive behavior / PRD lama sebelum draft PRD v0 atau Assessment Report dibuat (`core/change-management.md`).
- Untuk feature yang sudah punya brief, perubahan lanjutan harus **update Change Intake Brief dulu** sebelum patch PRD, Assessment Report, atau QA artifacts.
- Logical nama artefak analisa permanen adalah **Assessment Report**.
- Persisted filename saat ini masih boleh memakai suffix `-qa-assessment.md` untuk kompatibilitas struktur repo.
- **Analyst** adalah owner default untuk Assessment Report.
- **Reviewer Gate A / B / C** dan **Requirement Package Freeze** ada di `core/task-router.md` + `profiles/satuinbox.yml`.
- **QA output dipisah dua fase**:
  - pre-implementation: review PRD, regression impact, coverage/test strategy, automation candidate mapping
  - post-implementation: regression result, automation alignment, coverage confirmation, uncovered gap/defect note
- Template operasional workflow ada di `Assessments/templates/Setup/`, termasuk `change-intake-brief-template.md` untuk Phase 0.

---

## Orchestrator Mode (trigger: kata "orchestrator")

**Trigger:** kalau pesan user mengandung kata **`orchestrator`** (di mana saja), aktifkan mode ini untuk task tersebut. Tanpa kata itu → kerja normal (single-agent).

**Peran:**
- **Main agent = orchestrator.** Semua kendali di sini: spawn worker, terima hasil, spawn reviewer, jalankan loop, putuskan stop. Subagent TIDAK saling bicara langsung — semua transit lewat orchestrator.
- **Subagent = `leaf`** (via `delegate_task`). Worker mengerjakan; reviewer menilai.

> ⚠️ **Koreksi penting (2026-08-20):** `delegate_task` TIDAK punya parameter `kind`, dan `delegation.role_models` bukan config asli Hermes (0% dibaca kode — verified di `hermes-agent/hermes_cli/config_defaults.py` + `tools/delegate_tool.py`). Model subagent di-resolve dari **`delegation.model`/`delegation.reasoning_effort`** — flat, global, satu nilai untuk SEMUA subagent yang jalan saat itu. Tidak ada auto-routing per task type.

**Cara dapat model berbeda per role (manual swap, WAJIB sebelum tiap panggilan sequential):**
```bash
hermes config set delegation.model <model>
hermes config set delegation.reasoning_effort <effort>
# baru panggil delegate_task(role="leaf", goal=...)
```
Ini works untuk loop sequential (worker selesai → baru reviewer jalan) — TIDAK works untuk batch paralel (`tasks=[...]` dalam satu panggilan selalu share model yang sama, karena `delegate_task` resolve model sekali di awal sebelum loop task).

**Alur loop (worker → review → revise):**
1. **Swap model dulu** (lihat tabel referensi di bawah) → **Delegate worker** — beri goal + konteks lengkap (subagent tidak tahu isi chat ini).
2. **Swap model lagi** ke role reviewer → **Delegate reviewer** — kirim output worker + kriteria. Reviewer WAJIB akhiri dengan verdict eksplisit: `PASS` atau `NEEDS_REVISION: <daftar hal yang harus diperbaiki>`.
3. **Jika `NEEDS_REVISION`** → swap balik ke model worker → delegate worker lagi dengan feedback reviewer, lalu ulang dari langkah 2.
4. **Jika `PASS`** → selesai, laporkan hasil final ke user.

**Tabel referensi manual-swap (bukan auto-routing — orchestrator harus `hermes config set` sendiri sebelum tiap panggilan):**

| Task | Model swap ke... | Effort |
|---|---|---|
| Coding fitur/bugfix | `openai/gpt-5.5` | medium |
| Nulis kode mekanis/boilerplate | `cmc/deepseek/deepseek-v4-flash` | medium |
| Review kode | `openai/gpt-5.5` | high |
| Review umum (PRD/analisa) | `openai/gpt-5.5` | high |
| Analisa / deep-research | `openai/o3` | high |
| Debugging | `openai/gpt-5.5` | high |
| Planning | `cc/Codex-opus-4-8` | xhigh |
| Arsitektur | `cc/Codex-opus-4-8` | xhigh |
| Test case / QA | `openai/gpt-5.5` | high |

Kosongkan `delegation.model` (`hermes config set delegation.model ''`) setelah orchestrator loop selesai supaya sesi normal balik inherit model parent (`combo1`). Provider selalu ninerouter (semua model lewat proxy yang sama, port 20128).

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
2. `Rules/core/task-router.md` adalah source of truth untuk workflow
3. `Memory/global-memory.md` adalah source of truth untuk canonical product rules
4. `Rules/profiles/satuinbox.yml` adalah source of truth untuk governance strict (Phase 0, Gate A/B/C, freeze, approval — non-bypassable)
5. Setiap session wajib punya file summary aktif di `summary/` sesuai `core/artifact-governance.md`
6. Hasil analisa decision-bearing dipermanenkan di `Assessments/` sebagai **Assessment Report**
7. Jangan overwrite memory — update section relevan saja
8. **Precedence:** user boleh mengubah default kerja, tetapi TIDAK boleh melewati kontrol proyek yang ditandai wajib/non-bypassable (Phase 0 brief, approval gate, package freeze, retention policy). Kontrol non-bypassable SatuInbox menang atas input user.

## Imported Claude Cowork project instructions
