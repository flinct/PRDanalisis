# Audit SatuInbox — MULAI DARI SINI

> Pintu masuk tunggal. **Baca file bernomor di root secara berurut (00 → 03).** Detail per-area ada di sub-folder `detail-*/` — buka hanya saat butuh file:line.
> **Precedence:** kalau konflik, `01-audit-master-register.md` (v2.2, 144 findings) menang atas semua.

---

## Jalur Baca (root — urut atas ke bawah)

| # | File | Baca ini kalau… |
|---|---|---|
| — | `README.md` | kamu di sini (peta). |
| 00 | **`00-executive-brief.md`** | mau **ringkasan 1-halaman untuk manajemen** — verdict, blocker, roadmap. Entry non-teknis. |
| 01 | **`01-audit-master-register.md`** ⭐ | mau tahu **apa yang salah + prioritas**. CANONICAL, 144 findings. Single source of truth. Kalau ragu, ke sini. |
| 02 | **`02-reading-list-and-conflicts.md`** | mau **navigasi corpus**: peta Track A–H (§1), index Conversation (§4), resolusi konflik antar-file K1–K8 (§5). |
| 03 | **`03-coverage-gap-check.md`** | mau tahu **apa yang BELUM di-audit** (~40% Conversation: SLA engine, READ-path isolation). Baca sebelum simpul "sistem aman". |

**Alur cepat:** manajemen → `00`. Engineer/PM cari temuan → `01`. Bingung file mana → `02`. Cek kelengkapan → `03`.

---

## Detail (sub-folder — buka saat butuh file:line)

| Folder | Isi | Kapan dibuka |
|---|---|---|
| `detail-conversation/` | Track D/E raw + Track G sidebar-navigation + Track H conversation-list. Track G punya **1 file tunggal**: `2026-09-03-sidebar-navigation-synthesis.md`; Track G/H sudah folded ke register. **Baca dulu** `2026-09-07-conversation-list-deep-audit.md` bila fokus ke panel list; untuk scope Conversation luas mulai dari `2026-09-02-conversation-audit-merged.md` (105 finding). | butuh detail temuan Conversation / file:line. |
| `detail-infra/` | Track F — `satuinbox-infra-audit.md` (69 infra: secrets/CORS/SPOF; source `INFRA-01..10` di register) + `security-integrity-code-verified.md` (bukti file:line 8 confirmed priority). | verify/fix temuan infra atau security. |
| `detail-auth/` | Track K — `auth-register-onboard-subscription-audit.md` (as-built audit auth/register/onboarding/subscription + flow, FE+BE code-verified, source `AUTH-01..12` di register) + `reference/` competitor benchmark (Intercom/Zendesk/Freshchat/Qiscus/Crisp + Slack/Notion/Linear billing). | audit/fix/PRD-isasi domain auth/register/onboard/subscription. |
| `detail-uiux/` | Track B — `uiux-audit-report-sabrina.md` (33 heuristik Nielsen) + `uiux-impact-assessment.md` (impact analysis). | kerja UI/UX FE. |
| `database/` | Assessment Report **decision-bearing** untuk perubahan layer DB (topology/storage/retention). Bukan findings observasi — berisi keputusan go/hold/split. Saat ini: MongoDB Hot/Warm/Cold tiering → **`HOLD_FEATURE`**. | ada usulan perubahan database, butuh keputusan/risk. |
| `subscription/` | Assessment Report **decision-bearing** subscription (2026-10-06): benchmark 9 platform (`worker-eksternal-riset-platform-lain.md`) + review internal 16 findings `F-01..F-16` (`worker-internal-review-satuinbox.md`) + synthesis (`subscription-benchmark-dan-review-assessment.md`) + `reviewer-catatan.md`. Decision **`REVISE_PRD`**. Findings **belum folded** ke register — lihat `subscription/README.md`. | kerja billing/subscription, PRD addendum, atau fold `F-01..F-16` ke register. |
| `00-Timeline/` | Assessment Report + proposed CSV untuk timeline task SatuInbox berbasis effort-impact-testing (`S/O/N/D/B`). Bukan findings register. | susun/cek timeline roadmap task. |
| `reference/` | FDF knowledge (`conversation`, `tiket`, `productdomainmap`, `fdf-development-roadmap`). **Bukan temuan** — konteks "produk ini apa". | orientasi produk sebelum baca temuan. |
| `_source/` | Arsip file source yang temuannya sudah terserap ke `01`/`detail-*`. | **jangan dibaca** kecuali telusur jejak file:line lama. |

---

## Peta Track (ringkas — detail di `02` §1)

- **A** — code+PRD system-wide (61, folded ke `01`)
- **B** — UI/UX heuristik (33 → `detail-uiux/`)
- **C** — FDF knowledge (`reference/`, bukan temuan)
- **D/E** — Conversation raw (`detail-conversation/`, belum folded ke register)
- **F** — Infra/DevOps (69; 10 Critical folded jadi `INFRA-01..10` di `01`, sisa 59 di `detail-infra/`)
- **G** — Conversation-Sidebar-Navigation, sudah dikonsolidasikan ke 1 file tunggal dan folded via `CSN-01..12`
- **H** — Conversation-list (23; 17 confirmed + 1 corrected folded jadi `CLH-01..18` di `01`, clean/retracted tetap di source)
- **K** — Auth/Register/Onboarding/Subscription (12; folded jadi `AUTH-01..12` di `01`, FE+BE code-verified; shadow domain tanpa PRD/memory/test; AUTH-12 topup double-credit P0 money path; competitor benchmark di `detail-auth/reference/`)

## Status flag

`CANONICAL` patokan · `EVIDENCE` bukti confirmed · `SUPPORTING` narasi · `NEEDS-VALIDATION` belum aman backlog · `HISTORICAL` referensi lama (di `_source/`) · `DRAFT` knowledge, bukan decision.
