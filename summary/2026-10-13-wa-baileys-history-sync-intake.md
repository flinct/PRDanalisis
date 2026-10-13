# Summary — WhatsApp Baileys History Sync (Phase 0)

**Date:** 2026-10-13
**Task type:** Change Intake (Phase 0) + Assessment Report (decision-bearing)
**Domain:** WhatsApp Web (Baileys) → cross-domain Conversation ingest
**Owner:** Dany Christian (PM) / Eng Lead Naftal Yunior

## Request
User ingin History Sync WhatsApp (Baileys) 3 mode: sync today, sync older (today → 500 lebih lama), sync unread/gap (offline Sabtu+Minggu saat buka Senin). Minta pikirkan skenario lain + limitasi saat sync.

## Key findings
- **Baileys tidak punya API sync by-date/by-range.** Hanya: initial sync (volume fixed per browser preset), on-demand `fetchMessageHistory` (pagination mundur dari anchor), incremental/live saat reconnect.
- Mapping: today = filter lokal; older = loop pagination dari anchor; unread/gap = jalur reconnect (BUKAN fetchMessageHistory — tak bisa isi gap di tengah).
- **Fitur = remediation + baru.** History ingest sudah shipped & menyebabkan outage SEV-1 2026-07-20 (shared queue + no fast-path → 12.886 conv + 144k msg → blank total, RMQ restart manual).
- 10 limitasi + 8 risk (anchor dependency, on-demand drop issue #2452, HP utama harus online, media expired, WA throttle/ban, storage blow-up, timezone UTC, multi-tenant fan-out).

## Decision
`PROCEED_WITH_CAUTION` + `SPLIT_REQUEST`:
- Sub-A Ingest Hardening (P0, prasyarat) — queue split + fast-path + throttle + backpressure + dedup.
- Sub-B On-Demand UI (P1) — Mode A today + Mode B older.
- Sub-C Offline Gap Sync (P1/P2) — Mode C reconnect.
7 OQ blocking harus dikunci sebelum PRD. Can proceed to PRD: NO.

## Artifacts created
- `Assessments/whatsapp-web/history-sync/history-sync-change-intake-brief.md` (v1.0)
- `Assessments/whatsapp-web/history-sync/history-sync-assessment.md` (v1.0, dengan diagram: scope-vs-baileys, incident chain, target architecture, Mode B sequence)

## Evidence used
- `incident report/2026-07-20-pk12-10-rmq-sync-history-saturation.md` (RC-A..RC-G, action items B1–B10)
- Baileys docs (baileys.wiki/advanced/history-sync), Baileys issue #2452

## Next steps
Lock 7 OQ → verifikasi BE repo (fetchMessageHistory existence + RMQ queue audit) → verifikasi FE repo (UI status) → PRD Sub-A dulu.
