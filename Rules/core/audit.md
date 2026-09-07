# Audit Corpus Rule

> Berlaku untuk folder audit multi-file yang decision-bearing. Workspace utama: `Assessments/audit/`.
> Rule ini = kontrak struktur + sinkronisasi. **How-to mekanik** (git mv campuran, fold track → ID, conflict review) ada di skill `audit-corpus-index-maintenance` — baca skill itu saat mengeksekusi.

## 1. Struktur wajib (root-first journey)

Root folder audit HANYA berisi:

```
audit/
├── README.md                 ← MULAI DARI SINI: peta + urutan baca
├── 00-executive-brief.md     ← ringkasan non-teknis (manajemen)
├── 01-<canonical-register>.md ← SINGLE SOURCE OF TRUTH (temuan + prioritas + status)
├── 02-reading-list-*.md      ← navigasi track + konflik antar-file (K-table)
├── 03-coverage-gap-*.md      ← scope honesty: apa yang BELUM di-audit
├── detail-<domain>/          ← deep-dive per area (buka saat butuh file:line)
├── reference/                ← konteks produk (bukan temuan)
└── _source/                  ← arsip file yang temuannya sudah terserap
```

- File bernomor = jalur baca berurut. Nomor menentukan urutan, bukan tanggal/nama.
- **Detail TIDAK di root.** Deep-dive, source, evidence file:line → sub-folder `detail-*/`.
- `reference/` = knowledge/konteks, bukan finding. `_source/` = arsip, jangan dibaca kecuali telusur jejak.

## 2. Update file utama (WAJIB)

Setiap perubahan audit (temuan baru, fold track, koreksi):
1. **Update `01-register` lebih dulu** — tambah/ubah row (kolom lengkap: ID, domain, finding, severity, evidence, status, remediation, effort), bump Version + changelog, update Statistik + Total.
2. Sinkronkan file utama lain yang tersentuh: `README` (kalau struktur/urutan berubah), `02` (kalau track/konflik berubah), `03` (kalau coverage berubah).
3. **Dilarang** menaruh temuan sebagai file lepas di root. Temuan masuk `01` (folded) atau `detail-*/` (raw).

## 3. Nambah file utama root = KONFIRMASI DULU

File root bernomor baru (`04-`, dst) **harus disetujui user sebelum dibuat**.
Default tanpa konfirmasi: tempel ke file utama existing, atau simpan di `detail-*/`.
Alasan: setiap file root baru menambah beban jalur baca — hanya boleh kalau memang layer baca baru.

## 4. Sinkronisasi (anti-drift)

- **Satu source of truth:** `01-register` menang atas semua file audit. File lain tak boleh mengklaim angka/status berbeda diam-diam.
- **Konflik → dokumentasikan, bukan di chat:** konflik antar-file dicatat di `02` §Konflik (tabel: konflik / file / resolusi). Snapshot lama yang beda angka → banner HISTORICAL, jangan rewrite.
- **Bump versi / pindah file → langsung grep + fix path:** `README`, `00`, `02`, `03`, dan `Memory/global-memory.md`. Zero broken path sebelum lapor selesai. (`_source/` boleh tetap stale.)
- **README pendek:** cuma urutan baca + 1 baris "kenapa tiap file" + kapan buka folder detail + precedence + status flag. Detail hidup di `02`.

## 5. Arsip, bukan hapus

Source yang temuannya 100% terserap ke synthesis/register → `git mv` ke `_source/` (fallback `mv` untuk untracked). Buktikan absorpsi (traceability matrix / header konsolidasi) sebelum arsip. Delete hanya kalau user eksplisit minta.

## 6. Governance

Audit decision-bearing tetap tunduk approved project profile: version_and_changelog, no_invented_test_results, memory_conflict_flag non-bypassable. `01-register` = Assessment Report kanonik untuk corpus audit.
