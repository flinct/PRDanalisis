# Rules Migration Map (SatuInbox → Reusable Pack)

> Status: **COMPLETE — controlled migration done.**
> Struktur baru (`core/`, `integrations/`, `formats/`, `profiles/`) aktif sebagai entry point.
> File lama di `Rules/*.md` dipertahankan sebagai compatibility redirect (banner SUPERSEDED),
> isinya TIDAK dihapus agar referensi historis tidak silent-degrade.

---

## 1. Old → New Mapping (20 files)

| File lama | Tujuan | Status |
|---|---|---|
| `agent-instruction.md` | `core/task-router.md` (router + precedence) + `profiles/satuinbox.yml` (bootstrap produk) | ✅ redirect |
| `workflow-rule.md` | `core/task-router.md` + `core/change-management.md`; Gate A/B/C + freeze → `profiles/satuinbox.yml` governance | ✅ redirect |
| `requirements-lifecycle-rule.md` | `core/change-management.md`; Phase 0 + stage-transition → non-bypassable di profile | ✅ redirect |
| `structure-rule.md` | `profiles/satuinbox.yml` → `project.repository` | ✅ redirect |
| `summary-rule.md` | `core/artifact-governance.md` (transcript → `profiles/satuinbox.yml` summary) | ✅ redirect |
| `qa-analysis-rule.md` | `core/analysis-and-risk.md` + `core/test-design.md` | ✅ redirect |
| `impact-analysis-rule.md` | `core/analysis-and-risk.md` | ✅ redirect |
| `prd-writing-rule.md` | `core/requirements.md` + profile (ID format, bahasa, role) | ✅ redirect |
| `prd-comparison-rule.md` | `core/analysis-and-risk.md` (module) | ✅ redirect |
| `test-case-rule.md` | `core/test-design.md` + `formats/satuinbox-manual-tsv.md` | ✅ redirect |
| `automation-bridge-rule.md` | `integrations/satuinbox-playwright-bridge.md` | ✅ banner + isi utuh |
| `memory-routing-rule.md` | `core/knowledge-management.md` | ✅ banner + isi utuh |
| `memory-write-rule.md` | `core/knowledge-management.md` | ✅ banner + isi utuh |
| `memory-update-rule.md` | `core/knowledge-management.md` | ✅ banner + isi utuh |
| `global-memory-write-rule.md` | `core/knowledge-management.md` | ✅ banner + isi utuh |
| `global-memory-update-rule.md` | `core/knowledge-management.md` | ✅ banner + isi utuh |
| `prototype-rule.md` | `profiles/satuinbox.yml` → `project.repository.prototypes` | ✅ banner + isi utuh |
| `release-notes-rule.md` | `integrations/satuinbox-openproject-adapter.md` + `core/artifact-governance.md` | ✅ banner + isi utuh |
| `uat-rule.md` | `integrations/satuinbox-openproject-adapter.md` | ✅ banner + isi utuh |
| `analisa-prd-rule.md` | HAPUS (sudah stub deprecated, redundant) | ✅ dihapus |

---

## 2. Struktur Baru (aktif)

```
Rules/
├── core/                          ← 7 rule universal (tanpa token produk/repo/tracker/orang/path)
│   ├── task-router.md             ← ENTRY POINT — precedence + klasifikasi
│   ├── change-management.md       ← Phase 0 + lane light/standard/governed
│   ├── requirements.md            ← PRD writing
│   ├── analysis-and-risk.md       ← QA analysis + impact (applicability matrix)
│   ├── test-design.md             ← test case + traceability
│   ├── knowledge-management.md    ← memory routing + write/update + conflict flag
│   └── artifact-governance.md     ← versioning, naming, transcript (opt-in default)
├── profiles/
│   ├── satuinbox.yml              ← governance STRICT (15 non-bypassable controls)
│   └── _examples/                 ← simple-greenfield + high-compliance (test harness)
├── integrations/
│   ├── satuinbox-playwright-bridge.md
│   └── satuinbox-openproject-adapter.md
├── formats/
│   └── satuinbox-manual-tsv.md
├── MIGRATION.md                   ← file ini
├── validate-rules-pack.py         ← validator 3-profile (jalankan: python Rules/validate-rules-pack.py)
├── migrate-to-stubs.py            ← script step 6 (one-shot, sudah dijalankan)
└── *.md                           ← 20 file lama (redirect SUPERSEDED)
```

---

## 3. Precedence (final, sesuai koreksi user)

> **User boleh mengubah default kerja, tetapi TIDAK boleh melewati kontrol proyek yang
> ditandai wajib/non-bypassable** — Phase 0 brief, approval gate (Gate A/B/C), package
> freeze, retention policy (summary transcript verbatim).

Dikodekan di dua tempat:
1. `core/task-router.md` → "Non-bypassable controls" clause (baris 13-18).
2. `profiles/satuinbox.yml` → `governance.non_bypassable` (15 kontrol).

Kontrol non-bypassable SatuInbox (final):

| # | Kontrol | Enforced di |
|---|---|---|
| 1 | phase0_change_intake | profile → core/change-management |
| 2 | change_intake_brief (persist + versioned) | profile → core/change-management |
| 3 | stage_transition_confirmation (no bypass) | profile → core/change-management |
| 4 | protected_existing_behavior | profile → core/change-management |
| 5 | impact_analysis_shared (shared entity/lifecycle/SLA/RBAC/contract) | profile → core/analysis-and-risk |
| 6 | assessment_report_decision (persist permanen) | profile → core/analysis-and-risk |
| 7 | reviewer_gates (Gate A/B/C) | profile |
| 8 | requirement_package_freeze | profile |
| 9 | decision_enum (PROCEED/REVISE_PRD/SPLIT/HOLD) | profile → core/analysis-and-risk |
| 10 | traceability (requirement → test atau alasan) | profile → core/test-design |
| 11 | no_invented_test_results | profile → core/test-design |
| 12 | no_production_pii | profile → core/test-design |
| 13 | version_and_changelog | profile → core/artifact-governance |
| 14 | memory_conflict_flag | profile → core/knowledge-management |
| 15 | summary_transcript_verbatim | profile → core/artifact-governance |

---

## 4. Apa yang di-update saat aktivasi (sudah selesai)

| Target | Aksi | Status |
|---|---|---|
| `AGENTS.md` | entry point → core/task-router + profile; quick-map → core; Aturan Kritis #8 (precedence) | ✅ |
| `CLAUDE.md` | mirror AGENTS.md | ✅ |
| `WORKFLOW_CONTEXT.md` | rule index + archetype flow | ✅ |
| `Memory/README.md` | rule list + entry point + Phase 0 pointer | ✅ |
| `Memory/global-memory.md` | pointer line 367-374 → core | ✅ |
| `Assessments/templates/**` | "Rules Applied" → nama core + profile | ✅ |
| `Setup/pointers.yaml` | active_rules → core + profile + adapters | ✅ |
| `Setup/rules-config.yaml` | source_of_truth + phase_zero.rule → core | ✅ |
| `Setup/runtime.md` | refs rule lama → core | ✅ |
| 20 file lama | stub redirect (banner SUPERSEDED), hapus analisa-prd | ✅ |

**Sengaja TIDAK diubah (historis — redirect menangani):**
- `Assessments/**/versions/*` + `*-qa-assessment.md` + `*-change-intake-brief.md` (~40 files) — mencatat rule yang dipakai saat dibuat.
- `summary/*.md` (~8 files) — catatan historis.
- `Setup/.backups/**` — snapshot lama.
- `port/`, `presentation/`, `Test/conversation/...coverage-map.md` — refs ringan non-decision-bearing.

---

## 5. Uji 3-Profile (validated — `validate-rules-pack.py`)

| Profile | Mode | Harus menghasilkan |
|---|---|---|
| **SatuInbox** | strict | Phase 0 + brief wajib, stage-transition non-bypass, Gate A/B/C + freeze, Assessment Report decision-bearing, traceability, no-invented-results, summary transcript verbatim. |
| **simple-greenfield** | light | Tanpa Phase 0 berat; light lane; tanpa OpenProject; tanpa TSV SatuInbox. Core tidak butuh diubah. |
| **high-compliance-regulated** | governed | Governed lane + approval gate + retention policy wajib, tanpa detail SatuInbox. Core tidak butuh diubah. |

Run: `python Rules/validate-rules-pack.py` → `ALL CHECKS PASSED`.

---

## 6. Rollback

Karena file lama dipertahankan (redirect, bukan hapus), rollback = kembalikan 3 pointer entry
(`AGENTS.md`, `CLAUDE.md`, `Setup/rules-config.yaml`) ke `Rules/agent-instruction.md` /
`workflow-rule.md` / dst. Isi metodologi lama masih utuh di tiap file.
