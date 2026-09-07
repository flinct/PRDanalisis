# Orchestrator Engineer — Reference (NON-RULE, NOT auto-loaded)

> **Status:** REFERENCE ONLY. Bukan rule aktif, tidak di-inject tiap session.
> Mental model untuk redesign orchestrator. Governance nyata tetap di
> `Rules/core/task-router.md` + `Rules/profiles/satuinbox.yml` (menang atas dokumen ini).
> Batas teknis nyata: `delegation.max_concurrent_children: 3`, `max_spawn_depth: 1`,
> subagent background (hasil balik sendiri, kontrol live via `delegate_task action=steer/stop`).
> Adaptasi yang dipakai sudah masuk ke skill `workflow-orchestrator` (section "Orchestration hygiene").

Sumber: `orchestrator skill.md` (39-section spec). Disaring ke 5 poin yang benar-benar
menutup gap di setup PRDanalisis. Sisanya (worker imajiner Security/Performance/UX Engineer,
LEVEL 0-5 parallelism, live critical-path monitoring, dynamic depth-2 task creation)
**tidak applicable** — melanggar batas teknis di atas atau duplikasi governance existing.

## 5 poin yang diadopsi

### 1. Worker output contract (§29)
Tiap child `delegate_task` kembalikan block terstruktur agar orchestrator bisa update graph tanpa nebak:
```
STATUS: COMPLETED | FAILED | BLOCKED
SUMMARY:
FINDINGS:
ASSUMPTIONS:
RISKS:
OUTPUT:            (artifact paths)
FOLLOW-UP TASKS:
```

### 2. Validation ≠ completion (§14)
Worker selesai ≠ task diterima. Orchestrator validasi: completeness, correctness, consistency lintas-worker,
traceability ke requirement, actionability. Gagal → targeted rework (bukan restart penuh, §17).
Ini sudah jadi reviewer gate; dokumen ini memperkuat, bukan menggantikan.

### 3. Cross-worker conflict resolution (§15)
Jangan silently pilih di antara output kontradiktif. Saat dua child bentrok (mis. analyzer bilang sync,
architecture bilang async): identifikasi asumsi sumber → bandingkan evidence → pilih yang paling defensible
+ catat resolusi di summary. Kalau tak terpecahkan internal → `ask_user`.

### 4. Stale / change propagation (§16)
Upstream berubah → tandai output downstream `STALE`, tentukan mana yang re-run. Jangan pakai hasil basi.
Nyambung ke Phase 0 change-management (`Rules/core/change-management.md`).

### 5. Assumption + decision log (§20, §33)
Asumsi high-impact + keputusan orchestration penting dicatat eksplisit di file `summary/` session
(bukan disimpan diam-diam). Asumsi berubah → propagate ke task terdampak.

### 6. Artifact consolidation between phases
Loop revisi (reviewer → revise → analyzer ulang) sudah ada. Yang kurang: instruksi eksplisit supaya orchestrator inject artifact paths dari iterasi sebelumnya ke context child berikutnya (`EXISTING_ARTIFACTS`), dan reviewer cek artifact redundancy sebelum approve. Tujuan: user baca 3 file, bukan 6.

## Adopsi v2 (2026-09-02) — decision sharpness

Dari draft "Orchestrator Engineer v2" (27 rekomendasi). Diadopsi 6, dikompres ke section
"Decision sharpness" di skill `workflow-orchestrator`: risk-based depth, early stop,
escalation levels (ask_user vs require_approval), context boundary (allowed/forbidden paths),
parallel rule, Definition of Done.

**Ditolak (kapasitas tidak ada / duplikat):** DAG formal, workflow state machine 13-state,
idempotency/partial recovery, checkpoint & resume, execution trace/telemetry, artifact
lifecycle metadata 8-field, dynamic worker selection berbasis "historical reliability" —
tidak ada runtime enforcement untuk semuanya; sisanya duplikat hygiene #1-#6, change-management,
artifact-governance. Kalau Hermes kelak punya checkpoint/telemetry runtime, tinjau ulang.

## Retry vs escalation (§18-19) — ringkas
Retry hanya kalau failure recoverable + input bisa diperbaiki. Escalate ke user saat: repeated failure,
capability tak ada, requirement fundamental ambigu, output irreconcilable. Rem tetap max 3 revisi.
