# SLA Simulation Document

## Daftar Isi

1. [Aturan Dasar](#aturan-dasar)
2. [Tabel Awal (10 Skenario)](#tabel-awal-10-skenario)
3. [Analisis Tabel Awal](#analisis-tabel-awal)
4. [Full Coverage Simulation (40+ Skenario)](#full-coverage-simulation-40-skenario)
5. [Ringkasan Temuan](#ringkasan-temuan)
6. [Kesimpulan](#kesimpulan)

---

## Aturan Dasar

### Asumsi Operasional

| Parameter                 | Nilai         |
| ------------------------- | ------------- |
| Office Hour               | 08:00 - 17:00 |
| Break Time                | 12:00 - 13:00 |
| Shift Start               | 08:00         |
| Shift End                 | 17:00         |
| t1 (fixed untuk simulasi) | 11:00         |

### Definisi Metric

| Metric                        | Formula               | Keterangan                                                                   |
| ----------------------------- | --------------------- | ---------------------------------------------------------------------------- |
| **Wait Time**                 | `t2 - t1`             | Waktu dari first customer inbound (t1) sampai first assignment ke agent (t2) |
| **FRT (First Response Time)** | `t3 - t1`             | Waktu dari first customer inbound sampai first customer-facing reply         |
| **RLT (Response Lead Time)**  | Lihat aturan di bawah | Staff handling time dari assignment sampai first reply                       |
| **TTC (Time to Close)**       | `t4 - t1`             | Waktu dari first customer inbound sampai resolved/closed                     |

### Aturan RLT (Final)

> **Prinsip Dasar:**
>
> - RLT mengukur waktu handling agent dari assignment (t2) sampai first reply (t3)
> - Jika RLT terjadi **DI DALAM** break atau AUX → nilai **RAW** (tidak dikurangi)
> - Jika RLT **MELEWATI** break atau AUX → `Raw RLT - Break Time yang terlewati`
>
> **Catatan:**
>
> - AUX **tidak mengurangi** RLT (hanya break yang dikurangi)
> - Break time yang dimaksud adalah waktu break (12:00-13:00) yang **terlewati** selama durasi RLT
> - Jika RLT melewati multiple break (misal cross-day), semua break terlewati dikurangi

### Contoh Perhitungan RLT

| Skenario             | t2          | t3          | Raw RLT | Break Terlewati    | Adjusted RLT |
| -------------------- | ----------- | ----------- | ------- | ------------------ | ------------ |
| Di dalam break       | 12:05       | 12:30       | 25m     | 0m                 | **25m**      |
| Melewati break       | 11:50       | 13:10       | 80m     | 60m (12:00-13:00)  | **20m**      |
| Melewati 2 break     | 16:30       | Besok 08:20 | 950m    | 60m (break hari H) | **890m**     |
| Melewati break + AUX | 11:20 (AUX) | 13:30       | 130m    | 60m                | **70m**      |

---

## Tabel Awal (10 Skenario)

_Dari soal awal yang diberikan_

| No  | t1    | t2    | t3          | t4          | Wait Time      | FRT             | RLT            | TTC             |
| --- | ----- | ----- | ----------- | ----------- | -------------- | --------------- | -------------- | --------------- |
| 1   | 11:00 | 11:10 | 11:25       | 11:40       | 10 menit       | 25 menit        | 15 menit       | 40 menit        |
| 2   | 11:00 | 11:50 | 13:10       | 13:30       | 50 menit       | 2 jam 10 menit  | 20 menit       | 2 jam 30 menit  |
| 3   | 11:00 | 12:05 | 13:20       | 14:00       | 1 jam 5 menit  | 2 jam 20 menit  | 20 menit       | 3 jam           |
| 4   | 11:00 | 11:40 | 14:10       | 15:00       | 40 menit       | 3 jam 10 menit  | 1 jam 30 menit | 4 jam           |
| 5   | 11:00 | 13:15 | 13:45       | 14:30       | 2 jam 15 menit | 2 jam 45 menit  | 30 menit       | 3 jam 30 menit  |
| 6   | 11:00 | 16:30 | Besok 08:20 | Besok 09:00 | 5 jam 30 menit | 21 jam 20 menit | 50 menit       | 22 jam          |
| 7   | 11:00 | 11:55 | Besok 08:05 | Besok 10:00 | 55 menit       | 21 jam 5 menit  | 4 jam 10 menit | 23 jam          |
| 8   | 11:00 | 14:00 | 16:45       | Besok 09:10 | 3 jam          | 5 jam 45 menit  | 2 jam 45 menit | 22 jam 10 menit |
| 9   | 11:00 | 11:30 | 12:30       | 13:10       | 30 menit       | 1 jam 30 menit  | 30 menit       | 2 jam 10 menit  |
| 10  | 11:00 | 12:45 | 16:15       | 16:50       | 1 jam 45 menit | 5 jam 15 menit  | 3 jam 15 menit | 5 jam 50 menit  |

---

## Analisis Tabel Awal

### Evaluasi RLT dengan Aturan Final

| No  | t2    | t3          | Raw RLT | Break Terlewati                        | Adjusted RLT (Final) | RLT di Tabel | Status |
| --- | ----- | ----------- | ------- | -------------------------------------- | -------------------- | ------------ | ------ |
| 1   | 11:10 | 11:25       | 15m     | 0m                                     | **15m**              | 15m          | ✅     |
| 2   | 11:50 | 13:10       | 80m     | 60m (12:00-13:00)                      | **20m**              | 20m          | ✅     |
| 3   | 12:05 | 13:20       | 75m     | 55m (12:05-13:00)                      | **20m**              | 20m          | ✅     |
| 4   | 11:40 | 14:10       | 150m    | 60m (12:00-13:00)                      | **90m (1h30m)**      | 1h30m        | ✅     |
| 5   | 13:15 | 13:45       | 30m     | 0m                                     | **30m**              | 30m          | ✅     |
| 6   | 16:30 | Besok 08:20 | 950m    | 60m (break hari H)                     | **890m (14h50m)**    | 50m          | ❌     |
| 7   | 11:55 | Besok 08:05 | 1210m   | 60m (break hari H) + 5m (11:55-12:00?) | **1150m (19h10m)**   | 4h10m        | ❌     |
| 8   | 14:00 | 16:45       | 165m    | 0m                                     | **165m (2h45m)**     | 2h45m        | ✅     |
| 9   | 11:30 | 12:30       | 60m     | 30m (12:00-12:30)                      | **30m**              | 30m          | ✅     |
| 10  | 12:45 | 16:15       | 210m    | 15m (12:45-13:00)                      | **195m (3h15m)**     | 3h15m        | ✅     |

### Kesimpulan Analisis Tabel Awal

| Status                 | Jumlah | Nomor            |
| ---------------------- | ------ | ---------------- |
| ✅ Sesuai aturan final | 9      | 1,2,3,4,5,8,9,10 |
| ❌ Tidak sesuai        | 1      | 6,7              |

**Catatan untuk No 6 dan 7:**

- No 6: Tabel mencatat RLT=50m, seharusnya **890m (14 jam 50 menit)**
- No 7: Tabel mencatat RLT=4h10m, seharusnya **1150m (19 jam 10 menit)**

**Root Cause:** Tabel awal mengasumsikan RLT hanya dihitung selama office hour (08:00-17:00) excluding break, sehingga nilai cross-day menjadi sangat kecil.

---

## Full Coverage Simulation (40+ Skenario)

### SCENARIO A: Break Time

| No  | t1    | t2    | t3    | t4    | Status t2 | Status t3 | Wait Time | FRT   | Raw RLT | Break Terlewati   | Adjusted RLT | TTC   |
| --- | ----- | ----- | ----- | ----- | --------- | --------- | --------- | ----- | ------- | ----------------- | ------------ | ----- |
| A1  | 11:00 | 11:30 | 11:45 | 12:00 | Ready     | Ready     | 30m       | 45m   | 15m     | 0m                | **15m**      | 1h    |
| A2  | 11:00 | 11:50 | 12:10 | 12:30 | Ready     | Ready     | 50m       | 1h10m | 20m     | 10m (12:00-12:10) | **10m**      | 1h30m |
| A3  | 11:00 | 11:50 | 13:10 | 13:30 | Ready     | Ready     | 50m       | 2h10m | 80m     | 60m (12:00-13:00) | **20m**      | 2h30m |
| A4  | 11:00 | 12:05 | 12:25 | 12:50 | Ready     | Ready     | 1h5m      | 1h25m | 20m     | 20m (12:05-12:25) | **0m**       | 1h50m |
| A5  | 11:00 | 12:05 | 13:20 | 14:00 | Ready     | Ready     | 1h5m      | 2h20m | 75m     | 55m (12:05-13:00) | **20m**      | 3h    |
| A6  | 11:00 | 11:00 | 12:30 | 13:00 | Ready     | Ready     | 0         | 1h30m | 90m     | 30m (12:00-12:30) | **60m**      | 2h    |

### SCENARIO B: AUX (berbagai posisi) -- perlu diperhatikan lagi kalkulasinya (SCENARIO INI BOLEH DISKIP)

| No  | t1    | t2    | t3    | t4    | Status t2 | Status t3 | Wait Time | FRT   | Raw RLT | Break Terlewati   | Adjusted RLT | TTC   |
| --- | ----- | ----- | ----- | ----- | --------- | --------- | --------- | ----- | ------- | ----------------- | ------------ | ----- |
| B1  | 11:00 | 11:20 | 11:35 | 12:00 | AUX       | AUX       | 20m       | 35m   | 15m     | 0m                | **15m**      | 1h    |
| B2  | 11:00 | 11:20 | 12:00 | 12:30 | AUX       | Ready     | 20m       | 1h    | 40m     | 0m                | **40m**      | 1h30m |
| B3  | 11:00 | 11:20 | 13:30 | 14:00 | AUX       | Ready     | 20m       | 2h30m | 130m    | 60m (12:00-13:00) | **70m**      | 3h    |
| B4  | 11:00 | 11:00 | 11:45 | 12:15 | AUX       | AUX       | 0         | 45m   | 45m     | 0m                | **45m**      | 1h15m |
| B5  | 11:00 | 13:30 | 14:30 | 15:00 | Ready     | AUX       | 2h30m     | 3h30m | 60m     | 0m                | **60m**      | 4h    |
| B6  | 11:00 | 13:30 | 16:45 | 17:15 | Ready     | AUX       | 2h30m     | 5h45m | 195m    | 0m                | **195m**     | 6h15m |
| B7  | 11:00 | 11:00 | 14:00 | 14:30 | AUX       | AUX       | 0         | 3h    | 180m    | 60m (12:00-13:00) | **120m**     | 3h30m |

### SCENARIO C: t2 dalam shift, t3 setelah shift (melewati end of day)

| No  | t1    | t2    | t3    | t4    | Status t2 | Status t3 | Wait Time | FRT   | Raw RLT | Break Terlewati   | Adjusted RLT | TTC   |
| --- | ----- | ----- | ----- | ----- | --------- | --------- | --------- | ----- | ------- | ----------------- | ------------ | ----- |
| C1  | 11:00 | 11:30 | 17:10 | 17:30 | Ready     | Ready     | 30m       | 6h10m | 340m    | 60m               | **280m**     | 6h30m |
| C2  | 11:00 | 12:10 | 17:10 | 17:30 | Ready     | Ready     | 1h10m     | 6h10m | 300m    | 50m (12:10-13:00) | **250m**     | 6h30m |
| C3  | 11:00 | 13:00 | 17:10 | 17:30 | Ready     | Ready     | 2h        | 6h10m | 250m    | 0m                | **250m**     | 6h30m |
| C4  | 11:00 | 13:00 | 18:30 | 19:00 | Ready     | Ready     | 2h        | 7h30m | 330m    | 0m                | **330m**     | 8h    |

### SCENARIO D: t2 setelah shift, t3 setelah shift (sama-sama di luar shift)

| No  | t1    | t2    | t3    | t4    | Status t2 | Status t3 | Wait Time | FRT   | Raw RLT | Break Terlewati | Adjusted RLT | TTC |
| --- | ----- | ----- | ----- | ----- | --------- | --------- | --------- | ----- | ------- | --------------- | ------------ | --- |
| D1  | 11:00 | 17:30 | 17:45 | 18:00 | Ready     | Ready     | 6h30m     | 6h45m | 15m     | 0m              | **15m**      | 7h  |
| D2  | 11:00 | 17:30 | 18:30 | 19:00 | Ready     | Ready     | 6h30m     | 7h30m | 60m     | 0m              | **60m**      | 8h  |
| D3  | 11:00 | 18:00 | 18:30 | 19:00 | Ready     | Ready     | 7h        | 7h30m | 30m     | 0m              | **30m**      | 8h  |
| D4  | 11:00 | 19:00 | 19:30 | 20:00 | Ready     | Ready     | 8h        | 8h30m | 30m     | 0m              | **30m**      | 9h  |

### SCENARIO E: t2 setelah shift, t3 keesokan hari

| No  | t1    | t2    | t3          | t4          | Status t2 | Status t3 | Wait Time | FRT    | Raw RLT | Break Terlewati | Adjusted RLT | TTC |
| --- | ----- | ----- | ----------- | ----------- | --------- | --------- | --------- | ------ | ------- | --------------- | ------------ | --- |
| E1  | 11:00 | 17:30 | Besok 08:30 | Besok 09:00 | Ready     | Ready     | 6h30m     | 21h30m | 900m    | 60m             | **840m**     | 22h |
| E2  | 11:00 | 18:00 | Besok 09:00 | Besok 10:00 | Ready     | Ready     | 7h        | 22h    | 900m    | 60m             | **840m**     | 23h |
| E3  | 11:00 | 19:00 | Besok 10:00 | Besok 11:00 | Ready     | Ready     | 8h        | 23h    | 900m    | 60m             | **840m**     | 24h |

### SCENARIO F: Kombinasi Break + AUX + Cross-day

| No  | t1    | t2    | t3          | t4          | Status t2 | Status t3 | Wait Time | FRT    | Raw RLT | Break Terlewati | Adjusted RLT | TTC    |
| --- | ----- | ----- | ----------- | ----------- | --------- | --------- | --------- | ------ | ------- | --------------- | ------------ | ------ |
| F1  | 11:00 | 11:50 | Besok 08:10 | Besok 09:00 | Ready     | Ready     | 50m       | 21h10m | 1220m   | 60m             | **1160m**    | 22h    |
| F2  | 11:00 | 11:50 | Besok 08:10 | Besok 09:00 | AUX       | Ready     | 50m       | 21h10m | 1220m   | 60m             | **1160m**    | 22h    |
| F3  | 11:00 | 12:10 | Besok 08:30 | Besok 09:30 | Ready     | Ready     | 1h10m     | 21h30m | 1220m   | 50m             | **1170m**    | 22h30m |
| F4  | 11:00 | 16:30 | Besok 08:20 | Besok 09:00 | Ready     | Ready     | 5h30m     | 21h20m | 950m    | 60m             | **890m**     | 22h    |
| F5  | 11:00 | 16:30 | Besok 09:30 | Besok 10:00 | AUX       | Ready     | 5h30m     | 22h30m | 1020m   | 60m             | **960m**     | 23h    |

### SCENARIO G: Boundary & Edge Cases

| No  | t1    | t2    | t3    | t4    | Status t2 | Status t3 | Wait Time | FRT | Raw RLT | Break Terlewati | Adjusted RLT | TTC   |
| --- | ----- | ----- | ----- | ----- | --------- | --------- | --------- | --- | ------- | --------------- | ------------ | ----- |
| G1  | 11:00 | 12:00 | 12:00 | 12:30 | Ready     | Ready     | 1h        | 1h  | 0       | 0m              | **0**        | 1h30m |
| G2  | 11:00 | 12:00 | 13:00 | 13:30 | Ready     | Ready     | 1h        | 2h  | 60m     | 60m             | **0**        | 2h30m |
| G3  | 11:00 | 12:00 | 13:00 | 13:30 | AUX       | AUX       | 1h        | 2h  | 60m     | 60m             | **0**        | 2h30m |
| G4  | 11:00 | 08:00 | 08:30 | 09:00 | Ready     | Ready     | **-3h**   | -   | -       | -               | **Invalid**  | -     |
| G5  | 11:00 | 13:00 | 13:00 | 13:30 | Ready     | Ready     | 2h        | 2h  | 0       | 0m              | **0**        | 2h30m |

---

## Ringkasan Temuan

### 1. Perbandingan RLT Antar Skenario

| Kategori       | Contoh Skenario        | Raw RLT | Adjusted RLT | Selisih (Break dipotong) |
| -------------- | ---------------------- | ------- | ------------ | ------------------------ |
| Di dalam break | A4 (12:05-12:25)       | 20m     | **0m**       | 20m                      |
| Melewati break | A3 (11:50-13:10)       | 80m     | **20m**      | 60m                      |
| Melewati shift | C1 (11:30-17:10)       | 340m    | **280m**     | 60m                      |
| Cross-day      | F4 (16:30-Besok 08:20) | 950m    | **890m**     | 60m                      |
| Di luar shift  | D1 (17:30-17:45)       | 15m     | **15m**      | 0m                       |

### 2. Boundary Cases yang Perlu Definisi Jelas

| Case | Pertanyaan                            | Rekomendasi                               |
| ---- | ------------------------------------- | ----------------------------------------- |
| G1   | t2 = t3 di awal break → RLT = 0?      | Acceptable, valid                         |
| G2   | t2=12:00, t3=13:00 → Adjusted RLT = 0 | Setuju karena seluruh durasi adalah break |
| G4   | t2 < t1                               | Harus invalid, sistem harus mencegah      |
| G5   | t2 = t3 di luar break → RLT = 0       | Acceptable, valid                         |

### 3. AUX Impact Analysis

| Skenario | AUX Position                       | Break Terlewati | Adjusted RLT | Efek AUX              |
| -------- | ---------------------------------- | --------------- | ------------ | --------------------- |
| B1       | Seluruhnya di AUX                  | 0m              | 15m          | Tidak mengurangi      |
| B3       | Melewati AUX + Break               | 60m             | 70m          | Hanya break dikurangi |
| B7       | AUX sepanjang RLT + melewati break | 60m             | 120m         | Hanya break dikurangi |

**Kesimpulan:** AUX tidak mempengaruhi RLT (tidak mengurangi), hanya break yang dikurangi.

### 4. Pattern Yang Teridentifikasi

Adjusted RLT = Raw RLT - (Break duration yang terlewati)

Dimana:

- Break duration yang terlewati = overlap antara interval [t2, t3] dengan [12:00, 13:00]
- Jika RLT melewati multiple break (cross-day), semua break dihitung
- AUX tidak pernah mengurangi RLT

---

## Kesimpulan

### Status Final

| Komponen                 | Status                                     |
| ------------------------ | ------------------------------------------ |
| Aturan RLT               | ✅ Finalized                               |
| Tabel Awal (10 skenario) | ✅ 9/10 sesuai, 2 perlu koreksi (No 6 & 7) |
| Full Coverage Simulation | ✅ 40+ skenario selesai                    |
| Boundary Cases           | ✅ Teridentifikasi                         |

### Action Items

1. **Koreksi No 6 pada tabel awal:**
   - RLT: dari 50m → **890m (14 jam 50 menit)**

2. **Koreksi No 7 pada tabel awal:**
   - RLT: dari 4h10m → **1150m (19 jam 10 menit)**

3. **Implementasi aturan final ke dalam kode:**
   ```python
   def calculate_adjusted_rlt(t2, t3):
       raw_rlt = t3 - t2
       break_overlap = calculate_break_overlap(t2, t3)
       return raw_rlt - break_overlap
   ```

Dokumentasi aturan AUX:

1. AUX tidak mengurangi RLT
2. Hanya break time (12:00-13:00) yang dikurangi

Validasi boundary:

1. Tolak jika t2 < t1
2. Handle t2 == t3 dengan RLT = 0

Lampiran: Rumus Lengkap
Wait Time
text
Wait Time = t2 - t1
Satuan: menit/jam (real time)

FRT (First Response Time)
text
FRT = t3 - t1
Satuan: menit/jam (real time)

RLT (Response Lead Time) - Adjusted
text
Raw RLT = t3 - t2
Break Overlap = duration of [t2, t3] ∩ [12:00, 13:00] for each day
Adjusted RLT = Raw RLT - Break Overlap
Satuan: menit/jam (real time, dikurangi break)

TTC (Time to Close)
text
TTC = t4 - t1
Satuan: menit/jam (real time)
