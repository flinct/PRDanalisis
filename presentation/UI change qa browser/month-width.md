# Requirement — Reduce Month Column Width

## Objective

Mengurangi lebar setiap kolom bulan pada timeline agar lebih compact.

Ukuran baru setiap kolom bulan harus menjadi **3/5 (60%) dari lebar saat ini**.

```text
new_month_width = current_month_width × 0.6
```

## Scope

Perubahan hanya berlaku pada **width kolom bulan** pada timeline.

Jangan mengubah:
- Urutan bulan.
- Struktur header bulan.
- Jumlah dan struktur week/sub-column.
- Tinggi header atau row.
- Posisi timeline.
- Frozen/sticky columns.
- Horizontal scrolling behavior.
- Styling warna, typography, border, atau elemen lain yang tidak berkaitan langsung dengan width.

## Width Rule

Jika width bulan saat ini adalah `W`, implementasikan:

```text
new_month_width = W × 3/5
```

Semua bulan harus menggunakan width baru yang sama secara konsisten.

Contoh:

```text
Current:
Sep = 5 unit
Oct = 5 unit
Nov = 5 unit

Target:
Sep = 3 unit
Oct = 3 unit
Nov = 3 unit
```

## Week Columns

Pembagian minggu di dalam setiap bulan harus tetap mengikuti struktur yang sekarang dan menyesuaikan secara proporsional terhadap width bulan.

Jangan mempertahankan width week lama jika menyebabkan overflow atau membuat total width bulan kembali membesar.

## Timeline

Setelah width dikurangi:
- Header bulan tetap aligned dengan week header.
- Week grid tetap aligned dengan month header.
- Grid timeline mengikuti width baru.
- Tidak boleh ada gap atau offset antar bagian timeline.

## Task / Bar Alignment

Perubahan width bulan tidak boleh merusak posisi task/bar.

Task harus tetap berada pada posisi timeline yang benar berdasarkan week-nya.

Contoh:
- Task pada Oct tetap berada di Oct.
- Task pada Oct W1 tetap dimulai di Oct W1.
- Task yang melintasi beberapa bulan tetap mengikuti grid.
- Tidak boleh terjadi offset antara month header, week header, grid, dan task/bar.

## Horizontal Scroll

Setelah width bulan dikurangi:
- Total timeline width harus otomatis mengikuti width baru.
- Horizontal scroll tetap bekerja normal.
- Jangan menambahkan hardcoded width yang menghasilkan empty space.
- Jangan mengubah behavior frozen/sticky column.

## Dynamic Month

Jika timeline mendukung penambahan bulan secara dinamis, bulan baru wajib menggunakan width yang sama:

```text
new_month_width = current_month_width × 0.6
```

Tidak boleh ada perbedaan width antara bulan existing dan bulan yang baru ditambahkan.

## Acceptance Criteria

1. Width setiap bulan menjadi **60% dari width sebelumnya**.
2. Semua bulan memiliki width yang konsisten.
3. Week-section menyesuaikan secara proporsional.
4. Month header tetap aligned dengan week header dan timeline grid.
5. Task/bar tetap aligned dengan week grid.
6. Tidak ada horizontal overflow yang tidak semestinya.
7. Horizontal scrolling tetap bekerja seperti sebelumnya.
8. Frozen/sticky columns tidak berubah.
9. Tinggi header dan row tidak berubah.
10. Styling visual tidak berubah selain efek yang disebabkan oleh pengurangan width.
11. Bulan yang ditambahkan secara dinamis menggunakan width baru yang sama.
12. Tidak ada regression pada positioning atau sizing task/bar.

## Implementation Constraint

Jangan melakukan redesign atau refactor layout yang tidak diperlukan.

Fokus perubahan hanya pada:

```text
MONTH WIDTH

Current = 100%
Target  = 60%
```

> **Reduce each month column width to 3/5 of its current width while preserving the existing timeline structure, alignment, scrolling, frozen columns, and task positioning.**
