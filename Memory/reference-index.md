# PRD Analysis Reference Index

## Purpose

File ini menjadi pintu navigasi dari `Memory/` ke reusable **PRD analysis reference** yang disimpan di `Assessments/reference/`.

Gunakan index ini ketika butuh:
- comparison V1 vs V2
- deep-dive cross-PRD reasoning
- loophole / conflict mapping
- supporting analysis untuk Assessment Report, PRD writing, impact analysis, atau test design

> **Rule singkat:**
> - canonical product rules tetap di `Memory/global-memory.md`
> - architecture reference tetap di `Memory/CLAUDE-be.md` dan `Memory/CLAUDE-fe.md`
> - reusable PRD deep-dive / comparison analysis ada di `Assessments/reference/`
> - decision-bearing output tetap di `Assessments/<domain>/<feature-slug>/...`

## Reference Files

| Reference | Fungsi Singkat | Path |
|---|---|---|
| Conversation PRD Cross Analysis | Loophole, conflict, dan cross-PRD reasoning domain Conversation V2 | `Assessments/reference/conversation-prd-cross-analysis.md` |
| Conversation SLA / RLT / FRT / TTC Analysis | Deep-dive definisi metric, formula, overlap, dan gap implementasi SLA Conversation | `Assessments/reference/conversation-sla-rlt-frt-ttc-analysis.md` |
| Conversation V1 vs V2 Comparison | Baseline migrasi Conversation V1 → V2 vs FE implementation | `Assessments/reference/conversation-v1-vs-v2-comparison.md` |
| Ticket V1 vs V2 Comparison | Baseline migrasi Ticket V1 → V2 vs FE / SLA implementation | `Assessments/reference/ticket-v1-vs-v2-comparison.md` |
| WhatsApp Web V1 vs V2 Comparison | Baseline migrasi WA Web V1 → V2 vs FE + BE implementation | `Assessments/reference/whatsapp-web-v1-vs-v2-comparison.md` |
| SLA Conversation Ticket | Cross-PRD alignment risk antara SLA Conversation V2 dan Ticket V2 | `Assessments/reference/sla-conversation-ticket.md` |
| Contact Context Visibility | RBAC / visibility scope reference untuk Contact list/detail/picker | `Assessments/reference/contact-context-visibility.md` |

## How To Use

1. Baca `Memory/global-memory.md` untuk rule stabil lintas fitur.
2. Baca `Memory/reference-index.md` untuk memilih deep-dive reference yang relevan.
3. Masuk ke file di `Assessments/reference/` hanya saat butuh analisa detail.
4. Jika hasil task menghasilkan keputusan baru (go / revise / hold), simpan ke Assessment Report regular di `Assessments/<domain>/<feature-slug>/...`.
