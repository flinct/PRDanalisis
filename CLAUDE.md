# CLAUDE.md — PRDanalisis Workspace Context

> File ini dibaca otomatis oleh Claude di setiap session baru.
> Workspace: `C:\Users\flinc\Desktop\PRDanalisis`
> Project: **SatuInbox** — Omnichannel Customer Service Platform

---

## ⚡ Wajib Dilakukan Pertama Kali

Sebelum mengerjakan apapun, baca dan ikuti:

```
Rules/agent-instruction.md
```

File ini adalah **master workflow** — berisi: deteksi tipe tugas, rule mana yang harus dimuat, cara muat konteks produk, dan cara eksekusi.

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
│   ├── structure-rule.md
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
├── Memory/                      ← product context & analysis (muat sesuai kebutuhan)
│   ├── README.md                ← memory index — baca untuk navigasi
│   ├── global-memory.md         ← canonical product rules (always load)
│   ├── CLAUDE-be.md             ← BE architecture reference
│   ├── CLAUDE-fe.md             ← FE architecture reference
│   ├── conversation-prd-cross-analysis.md
│   ├── conversation-sla-rlt-frt-ttc-analysis.md
│   ├── conversation-undeveloped-features-analysis.md
│   ├── conversation-v1-vs-v2-comparison.md
│   ├── sla-conversation-ticket.md
│   ├── ticket-v1-vs-v2-comparison.md
│   ├── whatsapp-web-v1-vs-v2-comparison.md
│   ├── contact-context-visibility.md
│   ├── comprehensive-undeveloped-features-analysis.md
│   └── impact-linked-chat-bubble-patch.md
├── PRD/                         ← source PRD files per domain
│   ├── Conversationv2/          ← SOURCE OF TRUTH (V1 deprecated)
│   ├── ticketv2/                ← SOURCE OF TRUTH (V1 deprecated)
│   ├── Whatsapp web v2/         ← SOURCE OF TRUTH (V1 deprecated)
│   ├── Broadcast/
│   └── Contact/
└── Assessments/                 ← hasil analisa permanen (QA Assessment Reports)
    └── templates/
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
| PRD Analysis / Review | `qa-analysis-rule.md`, `impact-analysis-rule.md` |
| PRD Writing | `prd-writing-rule.md`, `qa-analysis-rule.md` |
| Test Case / QA / UAT | `test-case-rule.md`, `qa-analysis-rule.md` |
| Bug Fix | `qa-analysis-rule.md`, `impact-analysis-rule.md` |
| Impact Analysis | `impact-analysis-rule.md`, `qa-analysis-rule.md` |
| PRD Comparison | `prd-comparison-rule.md`, `qa-analysis-rule.md` |
| Memory Write/Update | `memory-routing-rule.md` + rule tulis/update sesuai target |

> Detail lengkap ada di `Rules/agent-instruction.md`.

---

## Memory Load Priority

1. **Selalu load:** `Memory/global-memory.md`
2. **Load jika menyentuh BE:** `Memory/CLAUDE-be.md`
3. **Load jika menyentuh FE:** `Memory/CLAUDE-fe.md`
4. **Load sesuai domain:** lihat `Memory/README.md` untuk navigasi

---

## Aturan Kritis

1. Tidak ada tugas dikerjakan tanpa baca rule yang sesuai terlebih dahulu
2. `Rules/agent-instruction.md` adalah source of truth untuk workflow
3. `Memory/global-memory.md` adalah source of truth untuk canonical product rules
4. Hasil analisa decision-bearing dipermanenkan di `Assessments/`
5. Jangan overwrite memory — update section relevan saja
6. Jika ada konflik antara input user dan rule, **ikuti rule**
