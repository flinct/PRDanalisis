> ⚠️ **SUPERSEDED** — canonical rule sekarang di `core/artifact-governance.md`.
> File ini dipertahankan sebagai detail reference (metodologi/checklist lama) selama transisi;
> jangan pakai sebagai entry point untuk pekerjaan baru. Peta lengkap: `Rules/MIGRATION.md`.
> Isi di bawah TIDAK dihapus untuk menghindari silent degradation pada referensi lama.

# Summary Rule

Rule ini mengatur ringkasan session kerja yang dipersist selama session berjalan.

---

## Tujuan

Setiap session harus punya satu file summary aktif yang menyimpan rangkuman progres, keputusan, dan konteks penting dari session tersebut.

---

## Kewajiban

1. **Setiap session yang dibuat WAJIB memiliki file summary.**
2. File summary WAJIB disimpan di folder **`summary/`** pada root workspace.
3. Isi file summary WAJIB berupa **rangkuman dari session yang sedang berjalan**, bukan rangkuman umum repo.
4. **Setiap ada update substantif pada session, file summary WAJIB ikut diupdate.**
5. Nama file WAJIB memuat **tanggal** dan **judul singkat**.

---

## Format File

Gunakan format nama file berikut:

```text
summary/YYYY-MM-DD-judul-singkat.md
```

Contoh:

```text
summary/2026-07-15-rule-session-summary.md
```

Ketentuan penamaan:
- `YYYY-MM-DD` memakai tanggal session dibuat.
- `judul-singkat` ringkas, deskriptif, lowercase, dan dipisah tanda `-`.
- Untuk lanjutan session yang sama, update file yang sama; jangan buat file baru kecuali memang session baru.

---

## Isi Minimum Summary

Setiap file summary minimal berisi:

1. **Tanggal**
2. **Judul session**
3. **Tujuan / request utama user**
4. **Ringkasan progres / analisa / keputusan penting selama session**
5. **Status terakhir / next step**
6. **Transkrip percakapan lengkap** — semua turn user dan assistant sejak awal session, verbatim, urut kronologis.

Format bebas selama enam elemen minimum di atas ada.

---

## Aturan Transkrip Percakapan

1. Transkrip WAJIB ada di setiap file summary dan WAJIB ikut diupdate setiap file summary diupdate.
2. Simpan **semua turn** sejak awal session, tidak hanya highlight — user prompts dan assistant responses dua-duanya.
3. Urut kronologis, mulai turn 1. Setiap turn dilabeli `### Turn N — User` atau `### Turn N — Assistant`.
4. Isi turn ditulis **verbatim** (apa adanya) — jangan diparafrase, jangan diringkas, jangan diterjemahkan. Kalau turn user berupa image/attachment, tulis deskripsi singkat attachment lalu isi text-nya verbatim.
5. Blockquote (`> `) untuk isi user; markdown biasa untuk isi assistant. Code block, path, dan error string dipertahankan persis.
6. Turn baru yang muncul setelah update terakhir WAJIB ditambahkan sebelum summary disimpan ulang. Tidak boleh ada gap turn.
7. Redaksi hanya untuk secret/token/password/PII sesuai Guardrail — ganti dengan `[REDACTED]`, jangan hilangkan turn-nya.
8. Kalau transkrip menjadi sangat panjang, tetap simpan lengkap. Jangan potong. Kalau perlu, taruh di section paling bawah file supaya header ringkas tetap di atas.

---

## Waktu Update

File summary harus dibuat atau diperbarui pada kondisi berikut:

1. Saat session mulai dan scope utama sudah cukup jelas.
2. Setelah ada perubahan scope, keputusan penting, atau hasil kerja yang mengubah konteks session.
3. Sebelum agent mengakhiri pekerjaan besar pada session tersebut.

---

## Guardrail

- Jangan simpan rahasia, token, password, atau isi file sensitif ke summary.
- Summary adalah artefak operasional session, bukan pengganti artefak permanen seperti PRD, Assessment Report, atau memory.
- Jika request user menghasilkan artefak permanen lain, summary tetap wajib diupdate untuk mencerminkan status session.
