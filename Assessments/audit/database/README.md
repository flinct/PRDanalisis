# Audit — Database

> Assessment Report **decision-bearing** untuk perubahan pada layer database SatuInbox (topology, storage, retention).
> Berbeda dari Track A–J (findings audit observasi): folder ini berisi **keputusan** (go/hold/split) atas usulan perubahan DB, lengkap dengan Change Intake Brief + Assessment Report.

## Isi

| File | Tipe | Versi | Keputusan |
|---|---|---|---|
| `mongodb-hot-warm-cold-tiering-change-intake-brief.md` | Change Intake Brief (Phase 0) | v1.0 | route `HOLD_NEEDS_DISCOVERY` |
| `mongodb-hot-warm-cold-tiering-qa-assessment.md` | Assessment Report | v1.1 | **`HOLD_FEATURE`** → discovery `SPLIT_A` sebelum PRD |

## MongoDB Hot/Warm/Cold Tiering — ringkas

Usulan: tier data by umur (HOT 0-3 bln, WARM 4-6 bln, COLD ≥7 bln) untuk collection conversation & ticket.

**Keputusan: HOLD_FEATURE.** Jangan mulai PRD sampai discovery `SPLIT_A` selesai (data profiling OQ-01/02 + demand confirmation OQ-08 + scope lock OQ-09 + keputusan mekanisme COLD OQ-03/04/05).

Risk teratas:
- **P0 (F-01):** tier migration berbasis umur saja membekukan open conversation / snoozed ticket / SLA cycle RUNNING → state machine corruption. Kebijakan pindah tier wajib state-aware.
- **P1 (F-02):** KPI strip, "Lewat SLA", export XLSX, SLA cron pakai single-collection aggregate tanpa filter umur → data tiered hilang diam-diam.
- **P1 (F-05):** index TTL `expiresAt` (`expireAfterSeconds:0`) sudah ada di `conversation.schema.ts` — aktifkan retention = MongoDB **hard-delete**, bukan archive.
- **P1 (F-03):** COLD=S3 langgar rule non-bypassable database-per-service — butuh arbitrase Engineering Lead.

Owner: Analyst · PM Dany Christian · Eng Lead Naftal Yunior.
