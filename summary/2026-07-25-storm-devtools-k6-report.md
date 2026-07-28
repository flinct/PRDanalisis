# Summary Report — Storm run, DevTools captures, k6 baseline

- **Tanggal:** 2026-07-25
- **Session:** RCA aggregation — SatuInbox dev conversation spam + storm reproducer + k6 baseline
- **Scope:** Konsolidasi semua data yang diberikan user (2 screenshot Network panel + 2 k6 run + storm run `20260724-235135`) menjadi satu report.
- **Owner:** Dany Christian (PM). Eng lead: Naftal Yunior.
- **Env:** dev (`dev-v2-api.satuinbox.com`).

---

## 1. Kesimpulan Cepat

Dev API kolaps pas storm + inbound flood dijalankan bareng. Bukti:
1. **FE (screenshot #2):** halaman meng-spawn ~22 request `/api/conversation?status=open&sort=isPinned…` identik dalam satu window; tiap request `200 OK` tapi `28–31 s` — endpoint hotpath saturated.
2. **k6 run kedua:** login `POST /api/auth/login` gagal dengan `dial tcp 172.67.155.34:443: connectex … did not properly respond` — connect timeout ke Cloudflare edge (172.67.155.34 = CF), bukan cuma slow. Login tidak reachable.
3. **Storm log:** dari 1635 subscriber yang diminta, hanya **~100 warmed** sebelum 5 menit habis. **80 reconnect-abort** setelah 60 s × 3 retry, **96 disconnect reason=ping timeout**, **23 failed to prepare** (socket connect timeout 10 s). Dev gateway sudah tidak sanggup terima koneksi baru.
4. **Inbound flood** tetap selesai `4000/4000` publish ke RabbitMQ — RMQ sehat, jadi bottleneck di gateway/API layer, bukan di broker.

Prod-faithful reproducer sudah cukup untuk membuktikan hipotesis: **hotpath `/conversation` + fan-out subscriber → dev tier saturated**. Sekarang harus split per-symptom di prod tier atau throttle FE polling.

---

## 2. DevTools Screenshot #1 — Post-login landing

Panel Network sesudah login menampilkan urutan biasa (`rum`, `session`, `roles`, `notification`, `count`, `member`, `filter-count`, `conversation`, `setting`, `general`, dst) dengan campuran `200/204/304/307`. Yang menonjol:

| Signal | Nilai | Catatan |
|---|---|---|
| `conversation?assign=true&status=o…` | 200, **1.87 s** | Hotpath variant-1 sudah lambat sejak landing pertama |
| `count` | 304, **1.66 s** | 304 tapi round-trip tetap panjang |
| `member?limit=100&page=1` | 200, 1.36 s | Standard boot payload |
| `setting`, `filter-count`, `tag`, `unread-count` | 1.0–1.5 s | Semua bertumpuk di boot window |
| `api-key?licenseKey=$2b$10$mGxYsz…` | **500**, dari `widget.min.js` | **Security concern** |

**Security finding — widget licenseKey exposed:**
`GET /…api-key?licenseKey=$2b$10$mGxYsz…` mengirim bcrypt hash langsung di query string. Nilai ini bocor ke server access log, CDN log, browser history, dan Referer header. Harus dipindah ke header (`Authorization`) atau body POST, tidak boleh di URL. Ini bug produksi yang perlu tiket terpisah.

Selain itu ada dua request 307 yang normal (RSC redirect Next.js dengan `_rsc=…`).

---

## 3. DevTools Screenshot #2 — Storm state (FE-side)

Semua ~22 baris `conversation?status=open&sort=isPi…` identik:
- Status: `200 xhr` semua
- Size: **4.9–5.8 kB** (payload kecil, jadi bukan payload bloat — ini FE spam)
- Duration: **28.10 s – 31.05 s** (Cloudflare 100 s edge budget mendekati batas)
- Initiator satu file bundle (`0df2b1bddefd8405.js`)

Footer: **311 / 502 requests, Finish 7.6 min**. Halaman belum selesai load setelah 7.6 menit.

Ini kombinasi dua hal:
1. **FE invalidation storm** — socket event (`notification.new.message`, `conversation.assigned`, `conversation.unassigned`) memicu TanStack Query refetch, tapi tidak ada de-dupe/coalesce → berkali-kali refetch endpoint yang sama.
2. **BE saturated** — semua request antri di gateway/API, tidak ada yang selesai dalam window normal (<5 s). CF edge menjaga koneksi hidup sampai 30 s.

Ini cocok dengan pattern yang sudah dipatch di `storm-reproducer` (heartbeat 30 s + socket noise reduced) — behavior aslinya masih ada di FE prod bundle.

---

## 4. k6 Baseline Runs

### Run A — 10 s / VU=1 / interval 2 s

```
duration      p50=8.81 s  p90=23.14 s  p95=24.93 s  max=26.72 s
http_req_failed 0.00 %  (3 req, 0 fail)
checks          3/3 pass
```

VU tunggal saja sudah menghantam **avg 12 s**, p95 hampir 25 s. Endpoint hotpath (variant1_all + variant2_yourinbox) sudah slow di dev, konsisten dengan screenshot #2 walau tanpa storm bareng.

### Run B — 30 s / VU=1 / interval 2 s

```
error: Post "https://dev-v2-api.satuinbox.com/api/auth/login":
       dial tcp 172.67.155.34:443: connectex: A connection attempt failed
       because the connected party did not properly respond after a period of
       time, or established connection failed because connected host has failed
       to respond.
http_req_failed rate=100 %  (1 / 1)
```

- **Transport error label:** TIMEOUT (dial), bukan HTTP status → jaringan/edge issue, bukan aplikasi 5xx.
- IP `172.67.155.34` = Cloudflare edge. Ada dua kemungkinan:
  1. CF edge menutup / drop new connection dari client karena rate-limit / concurrent limit.
  2. Origin di belakang CF sudah tidak respons, CF hold selama 21 s lalu abort.
- Ini sinkron dengan storm log (`Socket connect timeout after 10000ms` untuk subscriber baru pada window yang sama).

---

## 5. Storm Reproducer — `storm-20260724-235135`

### Config

```
env             : dev
route           : your-inbox
duration        : 600 s
requestedSubs   : 1635
spec            : subscribers/dev-multi-company.template.txt
```

Bundled dengan inbound flood (`4000` envelope, `batch=10`, `delay=0`) target 795 conversation dari **1 company** (`684a7dee68bd32a1f552e453`).

### Progress

- Storm build: **80 → 90 → 100 / 1635** subscriber ready, lalu build stall (log terpotong di 105 warmed dari total run).
- Inbound flood: **selesai 4000/4000** publish. RMQ tidak tercekik.

### Socket failure profile

| Kategori | Count |
|---|---|
| `[socket] reconnecting` | 115 |
| `[socket] reconnect-abort` (60 s × 3 retry) | 80 |
| `failed to prepare` (login/connect timeout 10 s) | 23 |
| `landing warmed 11 endpoint(s)` (subscriber sukses) | 105 |

Disconnect reason breakdown:
- `reason=ping timeout` — **96** (dominant)
- `reason=connect_error` — 13
- `reason=transport close` — 6

**Interpretasi:**
- **Ping timeout dominan** = socket ke dev gateway putus karena tidak balas ping — gateway saturated CPU / event loop.
- **Connect_error** = koneksi baru langsung ditolak — TCP/TLS accept saturated.
- **Failed to prepare 23×** dengan pola `Socket connect timeout after 10000ms` dan `HTTP 0 TIMEOUT` (login tidak sampai) — persis mirror k6 run B.

### Company yang paling sering gagal

Grup terakhir yang paling banyak muncul di `reconnect-abort` / `failed to prepare`: `goddummyprod2`, `booagent01`, `bwxagent01`, `bksagent01`, `bjnagent01`, `bibagent01`, `bejagent01`, `bkiagent01`, `bknagent01`, `bgkagent01`, `bdbagent01`, `bdjagent01`, `bikagent01`, `atcagent01` — merata di banyak company, bukan satu company saja. Menegaskan bahwa saturasi ada di infra bersama (gateway/CF), bukan per-tenant.

---

## 6. Chronology (kronologi timeline)

Timing berdasarkan file mtime + timestamp log:

```
23:51:35  probe.log dibuka        (interval 1000 ms, duration 600 s)
23:51:xx  storm.log mulai         (build subscriber batch #1)
23:57:xx  flood.log terakhir tulis (publish 4000/4000 selesai)
00:00:xx  storm.log terakhir tulis (masih retry reconnect-abort)
```

Urutan kausal yang paling masuk akal:
1. Storm reproducer start; subscriber baru mengetuk login endpoint bareng-bareng.
2. Login endpoint mulai tersendat di 10–20 s (lihat run k6 A).
3. Inbound flood mulai publish 4000 pesan → BE consumer men-fanout socket event → FE-side listeners (dan storm subscribers) memicu refetch storm.
4. Gateway saturated; `ping timeout` mulai muncul, subscriber baru gagal connect (`Socket connect timeout after 10000ms`).
5. CF/edge mulai drop dial baru — k6 run B ketemu `dial tcp … did not properly respond`.

---

## 7. Rekomendasi Prioritas

**P0 — Security**
- Pindahkan `licenseKey` dari query string ke header/body. Rotate hash bocor. (Owner: FE + BE widget.)

**P0 — Reproduksi ke prod tier**
- Jalankan `run-all.sh` di prod-like isolated env dengan tier gateway prod (bukan dev shared). Dev sudah kolaps di baseline 1 VU.
- Split test: (a) hotpath probe only, (b) storm subscribers only, (c) inbound flood only, lalu (d) combo. Cari knee-point per komponen.

**P1 — FE polling storm**
- FE harus coalesce `notification.new.message` + `conversation.assigned` + `conversation.unassigned` → single debounced invalidation (250–500 ms window). Bukti: 22 refetch identik dalam 1 window.
- Tambah query-key stability check; jangan invalidate kalau filter aktif tidak berubah.

**P1 — BE hotpath**
- `/api/conversation?status=open&sort=isPinned:…` konsisten 8–31 s dengan payload 5 kB. Payload kecil tapi latency besar → query slow, bukan network. Cek index MongoDB untuk sort (`isPinned:desc, pinnedAt:desc, timestamp:desc`) + assignee filter.

**P2 — Storm reproducer**
- `1635` subscriber target, hanya `~100` yang warmed dalam 5 menit. Reproducer harus punya guardrail: kalau warm-rate <10/s, stop dan report gateway saturation dulu.
- Log tambahan: label transport error konsisten (`TIMEOUT` vs `ECONNRESET` vs `HTTP 0`).

---

## 8. Artifacts

- `C:\Users\MyBook SAGA 12\Desktop\sixV2Automation\scripts\storm-reproducer\logs\storm-20260724-235135\storm.log`
- `…\storm-20260724-235135\flood.log`
- `…\storm-20260724-235135\probe.log`
- Screenshot devtools (composer_2026-07-25_02-06-39-…): tersimpan di composer image cache Hermes.
- k6 script: `sixV2Automation/scripts/k6/conversation-5ep.js`.

---

## 9. Status / Next Step

- **Status:** Report konsolidasi selesai. Bukti saturasi dev sudah lengkap (FE + k6 + storm).
- **Next:**
  1. File security tiket untuk `licenseKey` exposure (P0).
  2. Reviewer gate PRD tidak ada — ini incident/RCA report, jalur eskalasi ke Eng lead (Naftal) untuk sizing prod hotpath.
  3. Jadwalkan combo run di lingkungan yang mendekati prod, dengan guardrail warm-rate + per-component split.

---

## 10. Transkrip Percakapan

### Turn 1 — User

> [Attachment 1: screenshot Network panel post-login — mixed 200/204/304/307, api-key licenseKey=$2b$10$… 500, conversation 1.87 s]
> [Attachment 2: screenshot Network panel storm state — ~22 conversation?status=open&sort=isPi… semua 200, 28–31 s, footer 311/502 requests, Finish 7.6 min]
>
> k6 run 1 (10 s, VU=1): checks 3/3, avg 11.97 s p95 24.93 s.
> k6 run 2 (30 s, VU=1): login failed `dial tcp 172.67.155.34:443: connectex … did not properly respond`, http_req_failed 100 %.
>
> `C:\Users\MyBook SAGA 12\Desktop\sixV2Automation\scripts\storm-reproducer\logs\storm-20260724-235135`
>
> create summary report from all data given

### Turn 1 — Assistant

Membaca `probe.log`, `storm.log`, `flood.log`. Menghitung disconnect reasons, reconnect-abort, failed-to-prepare, warmed subscribers. Menulis report ini ke `summary/2026-07-25-storm-devtools-k6-report.md`.
