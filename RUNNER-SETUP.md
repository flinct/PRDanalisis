# Per-Device Test Runner (jalankan Playwright di mesin masing-masing)

Secara default, tombol **Run** mengeksekusi Playwright di **host** (mesin yang menjalankan
`server.js`). Kalau kamu mau tiap PC **menjalankan run-nya sendiri** (pakai repo automation
di PC itu, supaya host tidak terbebani), gunakan **Runner Agent**.

## Konsep

```
[Browser di PC remote]  ──Run──►  [runner.js di localhost PC itu]  ──►  Playwright (repo lokal PC itu)
        ▲ data & UI dari host (192.168.x.x:3001)
```

Browser tidak bisa menjalankan Playwright sendiri, jadi tiap PC menjalankan `runner.js`
(agent kecil di `localhost`). Dashboard memanggil runner lokal itu, bukan host.

## Setup di tiap PC tester

1. Pastikan PC punya: Node.js, repo automation (sixV2Automation), dan browser Playwright:
   ```
   cd path\ke\sixV2Automation
   npm install
   npx playwright install
   ```
2. Salin **`runner.js`** (dari folder PRDanalisis) ke dalam repo automation itu, lalu:
   ```
   node runner.js
   ```
   Atau dari mana saja dengan menunjuk repo:
   ```
   set AUTOMATION_ROOT=C:\path\ke\sixV2Automation   &&   node runner.js
   ```
   Akan muncul: `▶ QA Runner Agent → http://localhost:9876`.
3. Di QA Browser (dibuka di PC itu) → **⚙ Settings → 5 · Execution**:
   - Pilih **"Run di perangkat ini"**.
   - URL runner: `http://localhost:9876` → klik **Test** (harus "✓ Runner aktif").
4. Sekarang tiap ▶ Run / ▶ Run all dieksekusi **di PC itu** memakai repo lokalnya. Output tetap
   tampil streaming di dashboard.

> Pengaturan ini **per-device** (disimpan di browser masing-masing). PC lain yang memilih
> "Run di host" tetap pakai host. Jadi bisa campur.

## Catatan

- Runner zero-dependency (cuma Node built-in). Port bisa diubah: `set RUNNER_PORT=9000`.
- Spec & grep dikirim dari dashboard; runner me-resolve spec relatif terhadap `AUTOMATION_ROOT`-nya sendiri.
- Karena dashboard di-serve via `http://` (bukan https), panggilan ke `http://localhost:9876`
  tidak kena mixed-content. Header CORS + Private-Network sudah di-set di runner.
- Run via runner **tidak** tercatat ke database host (test_runs). Status manual di UI tetap kamu set & Save seperti biasa.
