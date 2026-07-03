# Reference Analysis Library

Folder ini menyimpan **reusable PRD analysis reference** yang dipakai ulang lintas task.

Isi folder ini **bukan** Assessment Report final dan **bukan** canonical memory utama. Fungsinya adalah:
- comparison baseline
- deep-dive cross-PRD reasoning
- loophole / conflict map
- supporting analysis untuk assessment baru, PRD rewrite, impact analysis, dan QA test design

## Batasan

- **Jangan** simpan decision final feature baru di sini.
- Jika dokumen berisi keputusan resmi (`PROCEED`, `REVISE_PRD`, `HOLD`, dll), simpan di `Assessments/<domain>/<feature-slug>/...`.
- Jika dokumen adalah canonical rule stabil atau architecture baseline, simpan di `Memory/`.

## Current References

- `conversation-prd-cross-analysis.md`
- `conversation-sla-rlt-frt-ttc-analysis.md`
- `conversation-v1-vs-v2-comparison.md`
- `ticket-v1-vs-v2-comparison.md`
- `whatsapp-web-v1-vs-v2-comparison.md`
- `sla-conversation-ticket.md`
- `contact-context-visibility.md`
