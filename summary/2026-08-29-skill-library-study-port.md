# Session Summary

- **Tanggal**: 2026-08-29
- **Judul session**: skill-library-study-port
- **Tujuan / request utama user**: Pelajari 14 library skill (GitHub), ambil pola yang berguna, terapkan agar agent mengerjakan task lebih baik. Source boleh disertakan untuk referensi.
- **Status terakhir / next step**: Selesai. 3 pola di-port ke Rules/ PRDanalisis; scratch source di `~/.hermes/skill-study-src/` dihapus.

## Ringkasan progres / keputusan

Men-clone 14 repo skill (anthropics/skills, a-tokyo, gohypergiant, agentskills, 5 repo UI/UX, microsoft/hve-core, softaworks, simota, product-on-purpose, xul817899). Dua repo collide nama `agent-skills` (a-tokyo vs simota) — simota di-clone sebagai `simota-agent-skills`.

Hasil seleksi (Ponytail: hanya port yang genuinely mengisi gap — sisanya sudah tercakup rule existing):

1. **Agent Execution Contract** (pm-skills `deliver-prd`) → `Rules/prd-writing-rule.md`. Ditambah sebagai conditional section (Standard/Full PRD): Authoritative Sources, Do Not Touch, Requirement Verification Map, Stop and Escalate. Cocok dengan flow orchestrator/worker SatuInbox.
2. **Demand Screen L0–L4** (pm-skills `foundation-build-risk-review`) → `Rules/requirements-lifecycle-rule.md`. Memisahkan "bisa dibangun" vs "harus dibangun" sebelum klasifikasi change class.
3. **Anti-AI-default design guidance** (anthropics `frontend-design`) → `Rules/prototype-rule.md`. Mencegah 3 "AI default look" untuk prototype SatuInbox.

Ditolak (sudah ada): requirements-clarity 100-point rubric (tumpang tindih dgn Stage 1 Final Transition Confirmation Layer + Step 0C mandatory questions), edge-cases & acceptance-criteria (sudah di prd-writing-rule/test-case-rule), dan seluruh repo lain yang di luar domain PM/PRD/UI SatuInbox.

## Transkrip percakapan

### Turn 1 — User

> pelajari library skill ini, ambil dan terapkan agar agent mengerjakan task lebih baik lagi
> jika source perlu di sertakan untuk sewaktu" mencari refferensi juga boleh
>
> @url:`https://github.com/anthropics/skills?utm_source=chatgpt.com`
> @url:`https://github.com/a-tokyo/agent-skills?utm_source=chatgpt.com`
> @url:`https://github.com/gohypergiant/agent-skills?utm_source=chatgpt.com`
> @url:`https://github.com/agentskills/agentskills?utm_source=chatgpt.com`
>
> @url:`http://github.com/overseek944/frontend-ui-ux-skill?utm_source=chatgpt.com`
> @url:`https://github.com/nicohodt/claude-code-ui-ux-skill?utm_source=chatgpt.com`
> @url:`https://github.com/cuellarfr/design-skills?utm_source=chatgpt.com`
> @url:`https://github.com/richhemsley3/claude-design-skills?utm_source=chatgpt.com`
> @url:`https://github.com/livenetworks/claude-skills/tree/main/skills/frontend-design?utm_source=chatgpt.com`
>
> @url:`https://github.com/microsoft/hve-core/blob/main/.github/skills/project-planning/requirements-author/SKILL.md?utm_source=chatgpt.com`
> @url:`https://github.com/softaworks/agent-toolkit/blob/main/skills/requirements-clarity/SKILL.md?utm_source=chatgpt.com`
> @url:`https://github.com/simota/agent-skills/blob/main/scribe/SKILL.md?utm_source=chatgpt.com`
> @url:`https://github.com/product-on-purpose/pm-skills?utm_source=chatgpt.com`
> @url:`https://github.com/xul817899-byte/ai-product-requirements?utm_source=chatgpt.com`
>
> --- Context Warnings --- (14x "no content extracted")

### Turn 1 — Assistant

Clone seluruh repo shallow ke `~/.hermes/skill-study-src/`, baca SKILL.md ber-signal tinggi, lalu patch 3 rule (prd-writing-rule, requirements-lifecycle-rule, prototype-rule) dengan pola terpilih, tulis summary ini, dan bersihkan scratch.
