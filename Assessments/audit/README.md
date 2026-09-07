# Audit SatuInbox — MULAI DARI SINI

> Pintu masuk tunggal. **Baca file bernomor di root secara berurut (00 → 03).** Detail per-area ada di sub-folder `detail-*/` — buka hanya saat butuh file:line.
> **Precedence:** kalau konflik, `01-audit-master-register.md` (v1.5, 71 findings) menang atas semua.

---

## Jalur Baca (root — urut atas ke bawah)

| # | File | Baca ini kalau… |
|---|---|---|
| — | `README.md` | kamu di sini (peta). |
| 00 | **`00-executive-brief.md`** | mau **ringkasan 1-halaman untuk manajemen** — verdict, blocker, roadmap. Entry non-teknis. |
| 01 | **`01-audit-master-register.md`** ⭐ | mau tahu **apa yang salah + prioritas**. CANONICAL, 71 findings (Track A 61 + Track G infra 10). Single source of truth. Kalau ragu, ke sini. |
| 02 | **`02-reading-list-and-conflicts.md`** | mau **navigasi corpus**: peta Track A–G (§1), index Conversation (§4), resolusi konflik antar-file K1–K6 (§5). |
| 03 | **`03-coverage-gap-check.md`** | mau tahu **apa yang BELUM di-audit** (~40% Conversation: SLA engine, READ-path isolation). Baca sebelum simpul "sistem aman". |

**Alur cepat:** manajemen → `00`. Engineer/PM cari temuan → `01`. Bingung file mana → `02`. Cek kelengkapan → `03`.

---

## Detail (sub-folder — buka saat butuh file:line)

| Folder | Isi | Kapan dibuka |
|---|---|---|
| `detail-conversation/` | Track D/E/F + audit detail Conversation terbaru (conversation-list deep-dive). 6 file. **Baca dulu** `2026-09-07-conversation-list-deep-audit.md` bila fokus ke panel list; untuk scope Conversation luas mulai dari `2026-09-02-conversation-audit-merged.md` (105 finding). | butuh detail temuan Conversation di luar register. |
| `detail-infra/` | Track G — `satuinbox-infra-audit.md` (69 infra: secrets/CORS/SPOF; source `INFRA-01..10` di register) + `security-integrity-code-verified.md` (bukti file:line 8 confirmed priority). | verify/fix temuan infra atau security. |
| `detail-uiux/` | Track B — `uiux-audit-report-sabrina.md` (33 heuristik Nielsen) + `uiux-impact-assessment.md` (impact analysis). | kerja UI/UX FE. |
| `reference/` | FDF knowledge (`conversation`, `tiket`, `productdomainmap`, `fdf-development-roadmap`). **Bukan temuan** — konteks "produk ini apa". | orientasi produk sebelum baca temuan. |
| `_source/` | Arsip file source yang temuannya sudah terserap ke `01`/`detail-*`. | **jangan dibaca** kecuali telusur jejak file:line lama. |

---

## Peta Track (ringkas — detail di `02` §1)

- **A** — code+PRD system-wide (61, folded ke `01`)
- **B** — UI/UX heuristik (33 → `detail-uiux/`)
- **C** — FDF knowledge (`reference/`, bukan temuan)
- **D/E/F** — Conversation (`detail-conversation/`, belum folded ke register)
- **G** — Infra/DevOps (69; 10 Critical folded jadi `INFRA-01..10` di `01`, sisa 59 di `detail-infra/`)

## Status flag

`CANONICAL` patokan · `EVIDENCE` bukti confirmed · `SUPPORTING` narasi · `NEEDS-VALIDATION` belum aman backlog · `HISTORICAL` referensi lama (di `_source/`) · `DRAFT` knowledge, bukan decision.
