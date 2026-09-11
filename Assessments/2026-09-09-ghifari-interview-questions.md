# Live Interview Questions — Ghifari Naufal Nasrullah

**Interviewer:** [Nama Interviewer]  
**Tanggal:** [TBD]  
**Durasi:** 30-45 menit  
**Focus:** Automation experience + flaky bug troubleshooting

---

## Section 1: Automation Experience (15-20 menit)

### Q1. Tool & Framework (warm-up)
**"Automation tool apa yang pernah kamu pakai? Playwright, Selenium, Cypress, atau yang lain?"**

*Follow-up berdasarkan jawaban:*
- Kalau Playwright: "Struktur page object model-nya kayak gimana? Bisa jelasin satu contoh page object yang pernah kamu buat?"
- Kalau Selenium: "Bagaimana handle wait/sync issue? Implicit wait vs explicit wait, mana yang lebih sering kamu pakai dan kenapa?"
- Kalau Cypress: "Bagaimana cara kamu isolasi test data antar test case? Setiap test punya data sendiri atau share state?"

**Red flag:**
- Tidak bisa jelaskan struktur page object / locator strategy
- Jawab "selenium" tapi tidak tahu perbedaan implicit vs explicit wait
- Tidak pernah handling async/wait issue

**Good answer signal:**
- Menyebut page object pattern + alasan (reusable, maintainable)
- Tahu trade-off implicit vs explicit wait
- Pernah deal dengan timing issue, bisa jelaskan solutionnya

---

### Q2. Automation Coverage Decision
**"Dari 100 manual test case, kamu pilih yang mana yang di-automate dulu? Apa kriteria kamu?"**

*Probe untuk:*
- Risk-based prioritization (smoke test, core flow dulu)
- Frequency (regression, nightly run)
- Stability (API stable dulu, UI volatile skip dulu)
- ROI (test yang jalanin 10x/hari > test yang jalanin 1x/bulan)

**Red flag:**
- "Automate semua" (unrealistic, no prioritization)
- "Yang paling gampang dulu" (ignoring business value)
- Tidak menyebut stability/maintenance cost

**Good answer signal:**
- Core flow / smoke test first
- Mention regression frequency
- Aware of maintenance cost (UI changes → test brittle)

---

### Q3. CI/CD Integration (technical depth)
**"Automation test kamu jalan di mana? Local aja, atau sudah integrate ke CI/CD pipeline?"**

*Follow-up jika sudah CI/CD:*
- "Pipeline-nya trigger kapan? Setiap commit, sebelum merge, atau scheduled?"
- "Kalau ada test yang fail di pipeline, process-nya gimana? Block merge atau cuma notif?"
- "Pernah case tidak test pass di local tapi fail di CI? Root cause-nya apa?"

**Red flag:**
- Cuma jalan local, tidak pernah CI/CD
- Tidak tahu trigger strategy (pre-merge vs post-merge vs nightly)
- Tidak pernah debug local-vs-CI difference

**Good answer signal:**
- Pre-merge hook atau nightly run
- Blocking merge on critical test fail
- Pernah debug env difference (localhost vs CI container, browser version, network)

---

### Q4. Automation Maintenance
**"Test automation kamu pernah rusak semua gara-gara UI redesign atau API breaking change? Bagaimana kamu handle-nya?"**

*Probe untuk:*
- Page object isolasi (UI change cuma patch page object, test case tidak berubah)
- Locator strategy (data-testid > xpath brittle)
- API contract test (schema validation detect breaking change early)

**Red flag:**
- Tidak pernah experience maintenance pain (sign: automation coverage rendah)
- UI change → rewrite semua test (no page object pattern)
- Tidak tahu locator best practice (xpath absolut, index-based)

**Good answer signal:**
- Page object pattern = UI change terlokalisir
- Data-testid atau semantic locator (role, label) > xpath brittle
- API mock/contract test untuk isolasi breaking change

---

## Section 2: Flaky Bug Troubleshooting (10-15 menit)

### Q5. Flaky Bug Definition Check
**"Apa yang kamu maksud dengan 'flaky bug'? Bisa kasih contoh?"**

*Expected answer:*
- Bug yang kadang muncul, kadang tidak
- Non-deterministic, tidak consistently reproducible
- Contoh: race condition, timing issue, random test data collision, network flake

**Red flag:**
- Tidak tahu definisi flaky (confuse dengan intermittent bug vs environmental bug)
- Tidak bisa kasih contoh konkret

**Good answer signal:**
- Definisi clear: inconsistent repro
- Contoh real: race condition, async wait, test data collision

---

### Q6. Flaky Bug Investigation Strategy
**"Kamu dapat laporan bug yang kadang muncul, kadang tidak. Langkah pertama kamu apa untuk investigasi?"**

*Probe untuk systematic approach:*
1. **Pattern recognition:** Flake rate berapa? 10% atau 90%? Jam tertentu? User tertentu? Browser tertentu?
2. **Log inspection:** Error log apa yang muncul saat bug trigger? Null pointer? Timeout? 500?
3. **Repro attempt:** Bisa reproduce di local? Butuh berapa kali attempt? 10x, 100x?
4. **Isolasi variable:** Apakah terkait network, timing, data state, concurrency?

**Red flag:**
- Langsung conclude "cannot reproduce, close"
- Tidak ada systematic approach, cuma coba-coba random
- Tidak collect evidence (log, repro rate, pattern)

**Good answer signal:**
- Collect pattern first (rate, condition, environment)
- Check log untuk clue
- Isolasi variable (network off? Delay inject? Retry loop?)

---

### Q7. Flaky Bug Root Cause Example (experience check)
**"Pernah ketemu flaky bug yang akhirnya ketemu root cause-nya? Ceritain satu case."**

*Dengar untuk:*
- Story structure: symptom → investigation → root cause → fix
- Technical depth: race condition, async issue, cache stale, test data collision
- Resolution: fix code, add retry, add wait, isolate test data

**Red flag:**
- Tidak pernah resolve flaky bug (experience kurang)
- Story tidak clear (tidak ada root cause, cuma "ganti wait jadi lebih lama")

**Good answer signal:**
- Story lengkap: symptom → debug → root cause → fix
- Root cause technical: race condition, timing, state pollution
- Fix proper: code fix (bukan workaround "tambah sleep 5 detik")

---

### Q8. Flaky Test vs Flaky Product Bug
**"Flaky test automation vs flaky product bug, bedanya apa? Bagaimana kamu bedain keduanya?"**

*Expected distinction:*
- **Flaky test:** Test code issue (wait kurang, locator brittle, test data pollution) — fix test code
- **Flaky product bug:** Product code issue (race condition, async handling salah, backend timeout) — fix product code

*Probe:*
- "Kalau test flake, kamu fix test atau report ke dev?"
- "Kalau product flake, evidence apa yang kamu kumpulin sebelum report ke dev?"

**Red flag:**
- Tidak bisa bedain (assume semua flake = test issue)
- Selalu blame test (tidak pernah flag product race condition)
- Selalu blame product (tidak pernah audit test code quality)

**Good answer signal:**
- Clear distinction: test issue vs product issue
- Investigate first, tidak langsung blame
- Product flake → collect evidence (log, repro condition, network trace) sebelum report

---

## Section 3: Scenario-Based (5-10 menit)

### Q9. Scenario: Search Flake (relate to BUG-001 di test mereka)
**"Kamu test search conversation, kadang return hasil, kadang return 'Belum Ada Percakapan' meskipun data ada. Apa yang kamu cek?"**

*Expected approach:*
1. Check network tab: API return 0 result atau FE rendering issue?
2. Check timing: Search API slow? FE render before API complete?
3. Check filter interaction: Filter active yang conflict dengan search keyword?
4. Check cache: Stale cache return old empty result?
5. Reproduce with delay inject: Add 2s delay, apakah flake rate turun?

**Red flag:**
- Langsung conclude "backend bug" tanpa check API response
- Tidak check timing / async issue
- Tidak isolasi variable (filter, cache, network)

**Good answer signal:**
- Network tab first (API vs FE issue)
- Timing hypothesis (async race)
- Isolasi filter/cache/state

---

### Q10. Scenario: Automation Flake
**"Test automation kamu pass 8/10 kali, fail 2/10 kali dengan error 'element not found'. Apa yang kamu lakukan?"**

*Expected approach:*
1. Check wait strategy: Implicit wait cukup? Perlu explicit wait untuk element muncul?
2. Check locator: Element ID berubah? Dynamic content?
3. Check network: API slow 2/10 kali, element belum render?
4. Check state pollution: Previous test tidak cleanup, state bleed ke test ini?
5. Fix: Add explicit wait `waitFor(selector, {timeout: 10000})` atau isolasi test data

**Red flag:**
- Tambah sleep arbitrary (`sleep(5000)`) tanpa diagnose
- Ignore 2/10 fail ("pass rate 80% cukup")
- Tidak check previous test state pollution

**Good answer signal:**
- Diagnose first: wait, locator, state, network
- Explicit wait over sleep
- Aware of test isolation (state cleanup)

---

## Scoring Rubric

| Dimension | Weight | Pass Threshold | Notes |
|---|---|---|---|
| **Automation Tool Mastery** | 20% | Tahu page object pattern, wait strategy, locator best practice | Q1, Q2, Q4 |
| **CI/CD Integration** | 15% | Pernah run di CI, tahu trigger strategy, debug local-vs-CI | Q3 |
| **Flaky Bug Investigation** | 25% | Systematic approach, pattern collection, isolasi variable | Q6, Q7, Q9 |
| **Flaky Test vs Product Bug** | 15% | Clear distinction, tahu kapan fix test vs report product bug | Q8, Q10 |
| **Experience Depth** | 15% | Punya real story: automation maintenance, flaky bug resolved | Q4, Q7 |
| **Scenario Problem-Solving** | 10% | Logical debug flow, prioritas check (network, timing, state) | Q9, Q10 |

**Pass = 60%+ across dimensions.**

---

## Interviewer Notes

- **Jangan kasih hint terlalu cepat** — biarkan kandidat struggle 10-20 detik, lihat approach mereka
- **Follow-up "kenapa?"** untuk setiap jawaban — cek reasoning, bukan hafalan
- **Red flag terbesar:** Tidak punya real experience (automation cuma hello-world, flaky bug tidak pernah debug sampai root cause)
- **Green flag terbesar:** Story konkret dengan technical depth (race condition specific, API timeout specific, state pollution specific)

---

**End of Interview Questions**
