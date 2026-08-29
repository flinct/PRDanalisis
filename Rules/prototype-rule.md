> ⚠️ **SUPERSEDED** — canonical rule sekarang di `profiles/satuinbox.yml (project.repository.prototypes)`.
> File ini dipertahankan sebagai detail reference (metodologi/checklist lama) selama transisi;
> jangan pakai sebagai entry point untuk pekerjaan baru. Peta lengkap: `Rules/MIGRATION.md`.
> Isi di bawah TIDAK dihapus untuk menghindari silent degradation pada referensi lama.

# Prototype Rule

## Output Location

Semua prototype (HTML, single-file app, mockup, demo) wajib ditaruh di:

```
C:\Users\MyBook SAGA 12\Desktop\PRDanalisis\prototypes
```

## Naming Convention

```
prototypes/<YYYY-MM-DD>-<short-descriptor>.html
```

Contoh: `prototypes/2026-08-13-conversation-sidebar.html`

## Scope

Berlaku untuk:
- UI prototype / mockup interaktif
- Single-file HTML demo
- Prototype fitur sebelum implementasi di FE repo

Tidak berlaku untuk:
- Production code di FE/BE repo
- Assessment report / PRD (tetap di `Assessments/` / `PRD/`)

## Design Guidance (anti-"AI default")

Prototype SatuInbox adalah prototype produk nyata (bukan template), jadi hindari tiga "AI default look" yang hampir selalu keluar tanpa berpikir:

1. background cream hangat (~#F4F1EA) + serif display kontras tinggi + aksen terracotta
2. background nyaris-hitam + satu aksen acid-green / vermilion terang
3. layout broadsheet (hairline rules, border-radius 0, kolom padat ala koran)

Ketiga-duanya sah untuk brief tertentu, tapi itu *default*, bukan *pilihan*. Saat brief tidak mematok arah visual, jangan habiskan kebebasan itu untuk salah satu default di atas.

Prinsip cepat:
- **Ground in subject**: sebelum desain, pin sendiri subjek + audience + satu job halaman; nyatakan pilihan itu. Pilihan khas datang dari dunia subjek (materials, vernacular) — untuk SatuInbox berarti elemen live-chat/CS: bubble, message, status, SLA/clock, inbox list, bukan sekadar kartu generik.
- **Buat compact token system dulu**: 4-6 warna bernama, 2+ typeface dengan peran jelas (display dipakai hemat, body pelengkap), satu konsep layout, satu *signature element* yang diingat.
- **Satu risk satu tempat**: habiskan keberanian di satu elemen signature, jaga sisanya tenang dan disiplin. Chanel rule — sebelum "keluar", lepas satu aksesori.
- **Quality floor tanpa ribut**: responsive sampai mobile, keyboard focus terlihat, reduced-motion dihormati.
- **Copy = design material**: nama kontrol dari sisi user, bukan sistem. Active voice ("Simpan", bukan "Submit"). Error tidak minta maaf dan tidak vague; empty state adalah ajakan bertindak.
- **Dua pass**: brainstrom plan dulu → review melawan brief (kalau ada bagian yang terasa generik, revisi + sebut apa yang diubah) → baru tulis kode, semua warna/type diturunkan dari plan.

> Sumber: diadaptasi dari Anthropic `frontend-design` skill (CC-BY). Berlaku untuk semua prototype HTML, termasuk single-file dan inline widget.
