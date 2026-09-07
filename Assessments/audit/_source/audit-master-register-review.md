# Audit Master Register Review — t_4847e750

> **⚠️ HISTORICAL / SUPERSEDED (snapshot).** Angka di file ini (60 findings, C1–C15, V1–V26) = state register lama SEBELUM v1.2 (add DI-06, close V17). **Register hidup = `core/audit-master-register.md` v1.3, 61 findings — itu yang menang.** File ini disimpan untuk jejak review, JANGAN dipakai buat angka.

## Scope
Canonical register for SatuInbox audit. Covers 60 findings across 6 domains:
- Security / PII (SEC-01..08)
- Data Integrity (DI-01..05)
- Integration (INT-01..06)
- Performance (PERF-01..04)
- Operational (OPS-01..04)
- UX / Flow / SLA / QA

**Repo baseline:** BE `prod-2.7.0`, FE `prod-2.7.0-11`
**Single source of truth:** conflicts with other files → this register wins.

## Structure
| Section | Count | Purpose |
|---------|-------|---------|
| Confirmed Priority (items 1-8) | 8 | Code-verified bugs, direct remediation |
| Positive Controls (P1-P10) | 10 | Confirmed working controls, maintain |
| Confirmed Non-Priority (C1-C15) | 15 | Backlog fixes, lower severity |
| Needs-Validation (V1-V26) | 26 | PRD/memory-based, no code verification yet |
| Corrected (X1) | 1 | DLQ exists (was falsely claimed absent) |

## Evidence Standards
- **Status tiers:** `confirmed` (bukti kode) | `inference` (PRD/memory) | `corrected` | `needs-validation` | `closed`
- **Severity:** Catastrophe > Major > Medium > Low > Positive
- **Evidence must include:** file path + line number, grep verification, or absence verification
- **Conflicts resolved by:** code > memory > PRD (code wins)

## Critical Gate: ENV-01
Branch target conflict blocks ticketing. Repo local = `prod-2.7.0`, memory = `v2.8.0`.
All 7 confirmed priority items (DI-01, SEC-02, DI-04, SEC-04, INT-03, SEC-01, F-07) are
validated ONLY against `prod-2.7.0`. Must lock branch target before converting to tickets.

## Decision Taxonomy (from satuinbox.yml)
| Pattern | Decision |
|---------|----------|
| Code-verified bug, no business decision needed | PROCEED |
| SLA/business decisions pending PM+Eng | HOLD_FEATURE |
| PRD contradictions need resolution | REVISE_PRD |
| Non-priority confirmed fixes | PROCEED (backlog) |

## Expected Evidence for Compliance Verification
1. **File:line citations** for every `confirmed` item (exists in register)
2. **Grep output** proving absence or presence (e.g., "grep `merge.*contact` = absence verified")
3. **Schema/DB verification** (e.g., sparse vs unique index)
4. **Cross-reference** with CLAUDE-be.md / CLAUDE-fe.md / global-memory.md for needs-validation items
5. **Branch lock** evidence (ENV-01) before any confirmed item becomes a ticket

## Key Risks for Synthesis
- 26 needs-validation items are inference-only — no code evidence yet
- SLA 3-way conflict (F-01) and reopen definitions (F-02) are Catastrophe but require PM decision, not code fix
- DLQ retry state in-memory (RetryTracker Map) = data loss on restart (follow-up from FS-05 correction)
- 278 error mapper call sites (F-07) = massive remediation surface
