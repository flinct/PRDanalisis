# Session Summary — MongoDB Hot/Warm/Cold Tiering Impact Analysis

> **Date:** 2026-09-08
> **Task type:** Impact Analysis (infra topology change) — orchestrator multi-agent
> **Domains:** conversation-service, ticket-service (cross-domain)
> **Status:** COMPLETE — Gate A pass

## Request
User: "kalau topologi mongo kita ubah dengan metode hot/warm/cold (hot 0-3 bln, warm 4-6 bln, cold >=7 bln), bagaimana pengaruhnya, terutama ke collection conversation dan ticket." Kemudian: "pakai orchestrator, analisa dan review pengaruhnya ke aplikasi."

## Approach
Orchestrator loop: planner → analyzer → reviewer → analyzer(revise) → reviewer(confirm).
Model subagent: `cmc/deepseek/deepseek-v4-flash` (fallback dari `cbx/openai/gpt-5.5` yang 503).

## Live DB state (read-only via Grafana/mongodb-exporter)
- Replica Set `rs0` HEALTHY, 3-node (mongodb-0 PRIMARY), NOT sharded. MongoDB 8.0.20 Community, WiredTiger, WT cache 9 GiB, oplog ~10.5 GB.
- database-per-service: `satuinbox_conversation` + `satuinbox_ticket` terpisah.
- Atlas Search (mongot sidecar) per pod, flag-gated. PVC 200 GiB data + 50 GiB mongot/pod.
- Per-collection size/age distribution TIDAK terukur (exporter tak expose) → jadi OQ-01 blocking.

## Artifacts
- Change Intake Brief v1.0: `Assessments/cross-domain/mongodb-hot-warm-cold-tiering/mongodb-hot-warm-cold-tiering-change-intake-brief.md`
- Assessment Report v1.1: `Assessments/cross-domain/mongodb-hot-warm-cold-tiering/mongodb-hot-warm-cold-tiering-qa-assessment.md`

## Final Decision
**`HOLD_FEATURE`** → route discovery **`SPLIT_A`** (data profiling OQ-01/02 + demand confirmation OQ-08 + scope lock OQ-09 + keputusan mekanisme COLD OQ-03/04/05) SEBELUM PRD apa pun.

Rationale: demand L0/L1 (unconfirmed), 10/10 OQ blocking unanswered, konflik governance COLD=S3 vs database-per-service belum diarbitrasi, belum ada PRD formal untuk direvisi.

## Top Risks
- R-01 (Critical/F-01): age-only tier migration bekukan open conversation / snoozed ticket / RUNNING SLA cycle → state machine corruption.
- R-02 (High/F-02): KPI strip, "Lewat SLA", full XLSX export, SLA cron pakai single-collection aggregate no age-filter → silently miss data tiered.
- R-03 (High/F-03): COLD=S3 langgar rule non-bypassable database-per-service.
- R-07 (High/F-05): existing `expiresAt` TTL index (`expireAfterSeconds:0`) = MongoDB HARD-DELETE, bukan archive.
- F-04/F-06: socket write ke thread WARM/COLD; search/mongot index scope vs tier.

## Reviewer verdicts
- Iter 2: `revise_analysis` (decision enum salah REVISE_PRD, dangling finding refs, QP gap).
- Iter 3: `ok` — Gate A satisfied. Semua 3 defect fixed, evidence-grounding intact.

## Notes
- BE grounding: analyzer verifikasi ke audit corpus + global-memory (repo BE di luar workspace; klaim traceable ke audit artifacts).
- Tidak ada test result invented (semua Suggested/Pending).
- Warning saat restore config: gateway pre-update mixed sys.modules — jalankan `hermes gateway restart` bila perlu (tidak blocking task ini).
