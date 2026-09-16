# Roadmap Timeline — Rumus Penjadwalan Deterministik (v2)

> Owner: Analyst · Tim referensi: 2 dev + 1 QA/PM · Zero-tolerance perf.
> v2 setelah review eksternal: worked-example ditulis ulang dari trace scheduler asli (bukan manual), `pmSeparate` dihapus (Pilihan A), HOLD vs BLOCKED dipisah, `velocity` → `capacity_factor`, `risk` masuk task schema. Self-check Python PASS.

---

## 1. Rumus Durasi & Penjadwalan

### 1a. Effort → durasi dev (dev-weeks)

| Effort | Dev-weeks | Justifikasi |
|---|---|---|
| L | **2** | Quick win / FE-only / research memo. |
| M | **4** | Fitur normal 1 modul. Satu bulan kerja. |
| H | **8** | Fitur besar lintas modul / AI / channel baru. Dua bulan. |

### 1b. Testing → beban QA lane (qa-weeks)

| Testing | QA-weeks |
|---|---|
| L | **1** |
| M | **2** |
| H | **3** |

**QA = tail setelah dev, bukan paralel.** Task dianggap **done pada qa_end**, bukan dev_end. Dependency dihitung dari qa_end prasyarat (strict mode — QA juga pegang regression).

### 1c. Priority → urutan pengambilan task

**Presisi wording:** priority tidak mengubah effort/durasi task. Priority hanya menentukan task mana yang dipilih lebih dulu ketika beberapa task ready — konsekuensinya priority tetap memengaruhi delivery date karena task prioritas tinggi mengambil lane/resource lebih dulu.

```
score = P*1000 + Impact*100 + EffortInv*10 + TestingInv
  P:         P1=3, P2=2, P3=1
  Impact:    H=3, M=2, L=1
  EffortInv: L=3, M=2, H=1
  TestingInv:L=3, M=2, H=1
tiebreak: rank
```

Bobot berjenjang 1000/100/10/1 = lexicographic sort Priority→Impact→Effort→Testing→rank (identik §121 tabel); dimensi bawah tak pernah mengalahkan dimensi atas.

### 1d. Status task: HOLD vs BLOCKED (dipisah — jangan dicampur)

| Status | Arti | Efek downstream |
|---|---|---|
| `HOLD` | Tidak perlu dikerjakan sekarang (di-park, keputusan produk) | Dependent **boleh lanjut** (dep inert) |
| `BLOCKED` | Belum bisa dikerjakan (nunggu eksternal), output-nya dibutuhkan | Dependent **ikut ter-block** (deferred, tidak dijadwalkan) |

Klasifikasi seed sekarang:
- **21 DB topology** = HOLD (butuh RCA/perf evidence; bukan blocker fungsional task lain)
- **22 fraud dashboard** = HOLD (nunggu requirement; tak ada downstream)
- **28 shopee chat** = **BLOCKED** (nunggu seller account) → **29 tiktok ikut deferred** karena depends on 28

### 1e. Algoritma penempatan (greedy list-scheduling)

```
input: TASK{priority, impact, effort, testing, risk, dependencies[], status, pm_front_weeks}
       CONFIG{dev_lanes, qa_lanes, capacity_factor, weeks_per_month}

1.  exclude task status HOLD / BLOCKED dari eksekusi
2.  ready = task yang semua dep-nya selesai (qa_end);
      dep→HOLD    = inert (tidak memblok)
      dep→BLOCKED = memblok → task masuk DEFERRED, tidak dijadwalkan
3.  sort ready by score desc, tiebreak rank
4.  ambil task teratas
5.  dev lane  = lane dengan free time terkecil
6.  dev_start = max(dev_lane_free, max(dep.qa_end), pm_front_weeks)
7.  dev_end   = dev_start + DEV_WEEKS[effort] * risk / capacity_factor
8.  qa lane   = lane dengan free time terkecil
9.  qa_start  = max(qa_lane_free, dev_end)
10. qa_end    = qa_start + QA_WEEKS[testing] / capacity_factor
11. simpan; ulangi dari 2
12. makespan = max(qa_end); DEFERRED dilaporkan terpisah
```

### 1f. PM front-load = prerequisite duration (BUKAN resource)

`pm_front_weeks` hanya menunda `dev_start` (PRD/discovery harus selesai dulu). **Sengaja tidak dimodelkan sebagai resource** (tidak ada `pm_free` lane): V1 deterministik dan sederhana; konsekuensi yang diterima sadar — beberapa front-load bisa "berjalan" bersamaan di atas kertas.

> ponytail: PM-as-prerequisite, bukan PM-as-resource. Upgrade path: tambah `pm_free` lane (pm_start = max(pm_free, dep_end)) kalau konflik jadwal PM terbukti mengganggu urutan nyata. `pmSeparate` DIHAPUS dari config — dead parameter di model ini.

Default front-load: `{7: 2, 14: 3, 17: 1, 23: 2}` (task yang desc-nya eksplisit butuh PRD/design dulu).

---

## 2. Config & Task Schema

### CONFIG (mini-form di atas timeline)

```json
{
  "dev_lanes": 2,
  "qa_lanes": 1,
  "capacity_factor": 0.8,
  "weeks_per_month": 4.33
}
```

| Field | Default | Arti |
|---|---|---|
| `dev_lanes` | 2 | Jumlah developer = cap paralel dev. |
| `qa_lanes` | 1 | Jumlah tester = cap paralel QA. |
| `capacity_factor` | 0.8 | Produktivitas efektif **semua lane** (dev & QA): 20% hilang ke meeting/interupsi/bug. Durasi ÷ factor. Berlaku ke QA juga karena QA-nya merangkap PM — interupsinya sama nyata. |
| `weeks_per_month` | 4.33 | Konversi render minggu→bulan (52/12). |

### TASK schema (per-task, di seed — bukan config global)

```json
{
  "id": 14,
  "priority": "P2",
  "impact": "H",
  "effort": "H",
  "testing": "H",
  "risk": 1.3,
  "dependencies": [],
  "status": "active",
  "pm_front_weeks": 3
}
```

| Field | Default | Arti |
|---|---|---|
| `risk` | 1.0 | Multiplier durasi dev untuk blast-radius besar. Seed: hanya **14 grouping contact = 1.3** (identity merge race, migration). |
| `status` | active | `active` / `hold` / `blocked` (lihat §1d). |
| `pm_front_weeks` | 0 | Minggu PRD/discovery sebelum dev boleh mulai. |

---

## 3. Parameter — diterima / ditolak

**Diterima:** `capacity_factor` (buffer) · `status` hold/blocked (dipisah per §1d) · `risk` per-task · `pm_front_weeks` per-task.

**Ditolak (YAGNI):**
- Holiday/leave calendar — capacity_factor sudah menyerap; tambah saat commit tanggal-eksak.
- Context-switch penalty — double-counting dengan capacity_factor.
- Dependency lag — qa_end→dev_start sudah handoff natural.
- WIP limit — cap-per-lane sudah = WIP 1/lane.
- `pmSeparate` — **dihapus** (dead parameter setelah PM = prerequisite).

---

## 4. Worked Example — trace scheduler asli (bukan manual)

Config default (2 dev, 1 QA, cf=0.8). Durasi: `DEV_WEEKS × risk / 0.8`, QA `÷ 0.8`.

Trace 6 langkah pertama — konteks lengkap supaya alokasi lane terbaca:

| Urutan | Task | Score | Dev lane | dev_start → dev_end | qa_end | Kenapa lane itu |
|---|---|---|---|---|---|---|
| 1 | **4** wa research (E:L) | 3333 | **L0** | 0 → 2.5 | 3.8 | Score tertinggi, kedua lane free → L0 (indeks terkecil) |
| 2 | **5** infra (E:M) | 3322 | **L1** | 0 → 5.0 | 7.5 | L0 sudah dipakai #4 → earliest free = L1 |
| 3 | **7** sales PRD (E:M, pm2) | 3322 | **L0** | 2.5 → 7.5 | 10.0 | L0 free di 2.5 < L1 (5.0); pm=2 ≤ 2.5 tak menunda |
| 4 | **6** notif (E:M, T:H) | 3321 | **L1** | 5.0 → 10.0 | 13.8 | L1 free 5.0 < L0 7.5 |
| 5 | **2** GTM | 3223 | L0 | 7.5 → 12.5 | 15.0 | |
| 6 | **3** demo data | 3223 | L1 | 10.0 → 15.0 | 16.2 | |

Lanjutan task contoh:
- **#1 super admin**: dev L0 12.5 → 17.5, qa_end 20.0 (score 3222, antre setelah impact-H P1).
- **#14 grouping**: dev L1 **32.5 → 45.5** (8×1.3/0.8 = 13w), qa_end 49.2. pm_front 3 tidak menunda (lane baru free di 32.5 > 3).

Hasil global:
- **Makespan = 98.8 minggu ≈ 23 bulan** untuk 25 task terjadwal.
- **DEFERRED = [29 tiktok]** — ter-block oleh 28 shopee (BLOCKED, nunggu seller account). HOLD 21/22 di-exclude.
- Timeline lama (semua dipaksa Sep–Des, 4 bulan) = over-commit ~6×.

**Insight:** task ringan P3 (11 faq, 18 wizard, 19 widget) terdorong ke minggu 82+ karena **qa_lanes=1 = bottleneck**, bukan dev. Menambah 1 tester memangkas ekor lebih besar daripada menambah dev — uji `qa_lanes: 2` di config.

---

## Ringkasan angka (untuk implementasi tabel)

```
DEV_WEEKS = {L:2, M:4, H:8}
QA_WEEKS  = {L:1, M:2, H:3}          # tail after dev, done = qa_end
score     = P*1000 + Impact*100 + EffortInv*10 + TestingInv
dev_dur   = DEV_WEEKS[E] * risk / capacity_factor
qa_dur    = QA_WEEKS[T] / capacity_factor
status    = active | hold (dep inert) | blocked (dep memblok downstream)
CONFIG    = {dev_lanes:2, qa_lanes:1, capacity_factor:0.8, weeks_per_month:4.33}
TASK      = {priority, impact, effort, testing, risk:1.0, dependencies[], status, pm_front_weeks:0}
```
