> **FLAG: BASELINE / NEEDS-VALIDATION**  \n> Audit desk-based awal. Pakai sebagai baseline konflik PRD/memory; status final ada di `audit-master-register.md`.

# SatuInbox — System Audit Report

| Item | Detail |
|---|---|
| **Tanggal** | 2026-09-01 |
| **Analyst** | Dany Christian (Product Manager) |
| **Scope** | Semua modul; prioritas Conversation V2, Ticket V2, Broadcast |
| **Basis** | PRD V2 (source of truth) + `Memory/global-memory.md` + `Memory/comprehensive-undeveloped-features-analysis.md` + existing UI/UX Audit (Sabrina, Jun 2026) |
| **Metode** | Desk analysis PRD + canonical memory. TIDAK cross-check ke repo FE/BE (per keputusan scope) — status "developed" diambil dari implementation-status table di memory v2.5.0 |

> **Batas kepercayaan.** Status implementasi ("developed / partial / undeveloped") berasal dari snapshot memory v2.5.0, bukan pembacaan repo saat audit ini. Item bertanda ⚠️ perlu verifikasi kode sebelum dijadikan dasar keputusan rilis.

---

## 0 | Ringkasan Eksekutif

Empat sumbu audit:

1. **Miss flow** — alur yang putus / tidak terdefinisi / punya >1 definisi bertabrakan.
2. **UX tidak baik** — friksi, inkonsistensi, cognitive load.
3. **Fitur developed tapi belum matang** — sudah ada di produk tapi ada gap perilaku, mismatch PRD↔implementasi, atau lubang edge-case.
4. **Judgment analis** — risiko struktural yang tidak masuk 3 kategori di atas.

**Temuan paling kritikal (fix sebelum apa pun di atasnya dibangun):**

| # | Temuan | Sumbu | Severity |
|---|---|---|---|
| F-01 | SLA pause policy 3-way conflict (Hold vs Snooze vs SLA) belum di-lock | Miss flow | 🔴 Catastrophe |
| F-02 | Reopen behavior Conversation punya 3 definisi berbeda, dampak metrik undefined | Miss flow | 🔴 Catastrophe |
| F-03 | SLA color threshold: FE absolute-time vs PRD percentage — user lihat warna salah | Belum matang | 🔴 Major |
| F-04 | Broadcast US-2 "no room found creates one silently" bertabrakan dengan "no duplicate rooms" | Miss flow | 🔴 Major |
| F-05 | FRT start (`frtCountingStartAt`) belum di-lock: inbound vs assignment | Belum matang | 🔴 Major |
| F-06 | Group chat FRT disembunyikan FE padahal PRD minta tetap tampil | Belum matang | 🟡 Medium |

---

## 1 | MISS FLOW — alur putus / tak terdefinisi / bertabrakan

### 1.1 SLA pause 3-way conflict `[F-01]` 🔴

Tiga PRD memberi aturan bertentangan untuk pause SLA:

- Room v1.1 (Conv file 9): **Hold pause SLA**, Resume restore.
- Snooze v1.0 (Conv file 16): **"No SLA pause changes"**.
- RLT Adjusted: tergantung policy final yang belum ada.

**Efek:** ketika sebuah room di-Hold lalu di-Snooze (atau sebaliknya), tidak ada satu pun perilaku SLA yang benar secara deterministik. Metrik TTC/RLT bisa beda antar agent tergantung urutan aksi. Ini menular ke reporting, breach alert, dan CSAT SLA.

**Rekomendasi:** PM + Engineering lock satu matriks tunggal `state × metric → pause?`. Contoh baseline yang perlu diputuskan:

| State | FRT | TTC | RLT | Wait Time |
|---|---|---|---|---|
| Hold | ? | ? | ? | never |
| Snooze | ? | ? | ? | never |
| Waiting on Customer | no pause | pause | policy | never |
| AUX | policy | policy | policy | never |

Tanpa tabel ini terisi penuh & final, semua fitur turunan (Snooze Conversation, Hold/Resume header, Room Reminder) tidak boleh masuk build.

### 1.2 Reopen Conversation — 3 definisi `[F-02]` 🔴

- Chat Sessions (file 12): reopen = **new session**.
- Room (file 9): reopen = **toggle `closed`→`open`**.
- Reassign (file 13): reopen = **modal routing**.

Ketiganya beda dampak ke `firstAgentReplyAt`, siklus SLA, dan attribution. Global-memory sudah menandai "Conversation SLA reopen behavior still undefined" sebagai Open Question yang belum tertutup.

**Rekomendasi:** pilih satu definisi kanonik, definisikan eksplisit apakah reopen membuat SLA cycle baru (seperti Ticket) atau melanjutkan cycle lama. Ticket SLA sudah punya `slaState.cycleId` — samakan model atau nyatakan alasan bedanya.

### 1.3 Broadcast room routing paradox `[F-04]` 🔴

`PRD Broadcast.md` US-2 minta: "Append to existing room, no new rooms created" — tapi acceptance negatif-nya: **"No room found creates one silently."** Sementara US-1 `REPLY_ONLY` menyembunyikan broadcast dari Inbox.

**Efek:** broadcast ke kontak yang belum punya room → room dibuat diam-diam → di mode `REPLY_ONLY` room itu tersembunyi → balasan customer masuk ke room yang agent tidak tahu ada. Potensi conversation hilang / SLA jalan tanpa yang tahu.

**Rekomendasi:** definisikan state room yang dibuat oleh broadcast (mis. `broadcast_pending`, tidak masuk chat list sampai ada inbound reply). Aturan transisi `REPLY_ONLY` room → visible harus eksplisit di PRD Broadcast + Inbox.

### 1.4 Auto-reply × Presence definition mismatch 🟡

Auto-reply PRD (Conv file 1) mengasumsikan **Away = Unavailable**; Presence PRD punya wording **Away = Online**. Bot bisa memutuskan salah kapan harus balas.

**Rekomendasi:** lock definisi availability tunggal sebelum Auto-reply masuk backlog implementasi. (Sudah jadi Release Gate #1 di comprehensive-analysis — pertahankan gate itu.)

### 1.5 Linked ticket metric attribution belum ada 🟡

Multiple Ticket (file 18) + Relational (file 19) tidak mendefinisikan attribution ketika **banyak conversation → banyak ticket**. RLT & Wait Time inherit ke ticket detail tanpa aturan mana yang menang.

**Rekomendasi:** definisikan attribution rule (1:1, 1:N, N:1, N:N) sebelum Related Tickets & Merge dibangun.

### 1.6 Round Robin tanpa PRD 🟡

Global-memory: "Round Robin critical dependency — belum punya PRD sendiri." Auto-assignment disebut sebagai business rule Conversation tapi aturan distribusi (skill-based? load-based? sticky?) tidak ada dokumennya.

**Rekomendasi:** buat PRD Round Robin sebelum Auto-reply/Queue diperluas — keduanya bergantung padanya.

---

## 2 | UX TIDAK BAIK

Sebagian besar sudah tercatat di UI/UX Audit (Sabrina, Jun 2026, heuristic Nielsen). Yang berdampak ke flow inti:

### 2.1 Chat list — jumlah pesan tidak konsisten & filter sulit dikenali 🟡
Dari scope testing existing audit (area Inbox & Omnichannel). Unread counter tidak konsisten menurunkan kepercayaan agent ke angka → agent buka semua chat "untuk aman" = beban naik.

### 2.2 Filter buttons vs tabs — model mental campur 🟡
Chat list pakai **buttons** (Your Inbox, Unassigned, All, Closed, Starred, Spam, Junk) bukan tabs, tapi Ticket list pakai **tabs** (Semua + per-type). Dua paradigma navigasi untuk dua modul yang sering dipakai berbarengan → inkonsistensi (Nielsen #4).

**Rekomendasi:** satukan paradigma navigasi filter antar Conversation & Ticket.

### 2.3 SLA warna menyesatkan `[F-03]` 🔴 (juga masuk §3)
FE tampilkan warna dari absolute time (10m / 1 hari); PRD minta dari persentase sisa budget (>50% hijau / ≤50% kuning / ≤10% merah). Agent memprioritaskan chat pakai sinyal warna yang salah. Ini UX **dan** correctness bug.

### 2.4 Wording "Close" vs "Resolve" di Room 🟡
Global-memory: Room v1.1 minta UI-only close action pakai wording berbeda dari transisi status. Kalau tombol "Resolve" dan "Close" dua-duanya memetakan ke `closed` tanpa beda visual, agent bingung apakah kerjanya beda.

### 2.5 Broadcast composer — no autosave 🟡
`PRD Broadcast - Create.md` §15: MVP tanpa autosave, hanya leave-guard modal. Untuk form panjang (channel + sender + ribuan recipient + template + variabel + schedule), satu misclick "Leave without saving" = kerja hilang. Leave-guard mitigasi sebagian, bukan menghilangkan.

**Rekomendasi:** autosave sudah ada di Future Considerations — naikkan prioritas, ini form terpanjang di produk.

---

## 3 | FITUR DEVELOPED TAPI BELUM MATANG

Fokus: yang **sudah ada di build** tapi punya gap. (Yang 0% developed ada di §4.)

| Fitur | Status | Gap kematangan | Severity |
|---|---|---|---|
| SLA color threshold | ✅ developed | FE absolute-time, PRD percentage — mismatch `[F-03]` | 🔴 Major |
| FRT metric | ✅ developed | `frtCountingStartAt` belum di-lock: inbound vs assignment `[F-05]` | 🔴 Major |
| Group chat FRT | ✅ developed | FE sembunyikan FRT untuk semua group; PRD minta FRT tetap jalan `[F-06]` | 🟡 Medium |
| RLT & Wait Time | ✅ developed (v2.5.0) | Phase 1 hanya reporting — pastikan TIDAK masuk breach engine. Regression risk kalau engine salah baca | 🟡 Medium |
| Bulk Scan QR (WA) | ⚠️ Partial | Single QR ada, bulk queue popup tidak. Fitur setengah jalan | 🟢 Low |
| Custom Attributes | ✅ single, ❌ collections | Single field jalan; Collections (repeatable) belum. Search & relational matching pincang | 🟡 Medium |
| SLA mode (Agent vs Customer-centric) | ✅ TTC dihitung | Mode belum final → nilai TTC bisa berubah makna setelah keputusan. Data historis bisa jadi tidak comparable | 🔴 Major |

**Detail F-05 (FRT start):** data model punya `firstAgentAssignmentAt` terpisah dari `frtCountingStartAt`, mengindikasikan FRT harusnya start dari inbound. Tapi belum ada konfirmasi PM. Sampai di-lock, FRT yang ditampilkan bisa salah untuk conversation yang lama unassigned.

**Detail SLA mode:** kalau nanti diputuskan Customer-Centric (continuous) padahal build sekarang Agent-Centric (pause/resume) atau sebaliknya, semua TTC yang sudah tercatat berubah artinya → laporan lintas periode tidak apple-to-apple. **Keputusan ini makin mahal makin ditunda.**

---

## 4 | JUDGMENT ANALIS — risiko struktural

### 4.1 Backlog undeveloped besar & saling bergantung
15 fitur V2 masih 0% (FE+BE) per comprehensive-analysis. Yang berbahaya bukan jumlahnya, tapi **ketergantungannya ke keputusan yang belum diambil (§1)**:

- Snooze, Hold/Resume, Room Reminder → semua nunggu SLA pause matrix `[F-01]`.
- Related Conversations & Related Tickets → nunggu attribution rule `[1.5]`.
- Auto-reply → nunggu Presence definition `[1.4]` + Round Robin `[1.6]`.

**Judgment:** jangan estimasi/janjikan fitur-fitur ini sebelum decision-node di §1 tertutup. Membangun di atas policy yang belum final = rework hampir pasti.

### 4.2 Broadcast anti-spam: PRD kaya, implementasi kosong
`PRD Broadcast.md` sangat detail (tiered quota, spintax, failover, humanization, warming) tapi memory menandai **semua anti-spam 0% di BE**. Broadcast tanpa anti-spam yang dijanjikan PRD = risiko ban akun WhatsApp nyata (target PRD sendiri: <10% ban). Gap PRD↔realita ini harus diakui eksplisit ke stakeholder — jangan sampai sales menjual kapabilitas yang belum ada.

### 4.3 Deployment model — jangan ulangi klaim salah
Catatan lintas-sesi: SatuInbox = **SaaS multi-tenant ONLY**, tidak ada self-hosted/on-prem. Klaim "deployment flexibility" di `Assessments/strategy/*.md` salah dan perlu dibersihkan. Audit ini tidak mengoreksi file strategi, tapi menandai agar tidak dikutip.

### 4.4 Idempotency broadcast — bergantung request_id
Broadcast Create EC-004 mengandalkan idempotency by `draft_id/request_id` untuk cegah double-send. Ini titik kritikal: kalau idempotency key tidak enforced di BE, satu double-click = broadcast ganda ke ribuan orang. **Verifikasi enforcement server-side** sebelum broadcast volume besar dilepas.

### 4.5 Metrik yang belum final = utang data
`[F-05]` FRT start + SLA mode `[§3]` + reopen SLA `[F-02]` — ketiganya mempengaruhi angka yang **sudah dicatat sekarang**. Setiap hari data terkumpul dengan definisi belum-final menambah utang: saat definisi di-lock, data lama bisa perlu backfill atau di-flag non-comparable.

---

## 5 | Master Severity Matrix

| ID | Temuan | Modul | Sumbu | FE | BE | Severity | Blocker untuk |
|---|---|---|---|---|---|---|---|
| F-01 | SLA pause 3-way conflict | Conversation | Miss flow | — | — | 🔴 Catastrophe | Snooze, Hold, Reminder |
| F-02 | Reopen 3 definisi | Conversation | Miss flow | ✅ | ✅ | 🔴 Catastrophe | SLA reporting akurat |
| F-03 | SLA color FE≠PRD | Conversation | Belum matang / UX | ⚠️ | — | 🔴 Major | Prioritisasi agent benar |
| F-04 | Broadcast room paradox | Broadcast | Miss flow | — | — | 🔴 Major | Broadcast REPLY_ONLY |
| F-05 | FRT start belum lock | Conversation | Belum matang | ✅ | ✅ | 🔴 Major | FRT correctness |
| SLA-mode | Agent vs Customer-centric | Conversation | Belum matang | ✅ | ✅ | 🔴 Major | TTC comparability |
| F-06 | Group FRT disembunyikan | Conversation | Belum matang | ⚠️ | — | 🟡 Medium | Group SLA visibility |
| 1.4 | Auto-reply × Presence | Conversation | Miss flow | ❌ | ❌ | 🟡 Medium | Auto-reply release |
| 1.5 | Ticket attribution rule | Ticket | Miss flow | ❌ | ❌ | 🟡 Medium | Related Tickets & Merge |
| 1.6 | Round Robin no PRD | Conversation | Miss flow | partial | partial | 🟡 Medium | Queue/Auto-reply |
| 2.2 | Filter buttons vs tabs | Conv/Ticket | UX | ✅ | — | 🟡 Medium | — |
| 2.5 | Broadcast no autosave | Broadcast | UX | ✅ | — | 🟡 Medium | — |
| 4.2 | Anti-spam PRD≠build | Broadcast | Judgment | ❌ | ❌ | 🔴 Major | Broadcast volume besar |
| 4.4 | Idempotency broadcast | Broadcast | Judgment | ✅ | ⚠️ | 🔴 Major | Broadcast double-send |
| CA | Collections attr | Conversation | Belum matang | ❌ | ❌ | 🟡 Medium | Search/relational |
| Bulk | Bulk Scan QR | WA Web | Belum matang | ⚠️ | ⚠️ | 🟢 Low | — |

---

## 6 | Diagram

### 6.1 Decision-node dependency (kenapa urutan fix penting)

```
        ┌─────────────────────────────┐
        │  F-01 SLA pause matrix       │  ← lock DULU
        │  (Hold/Snooze/AUX/WoC)       │
        └───────────┬─────────────────┘
                    │ blocks
     ┌──────────────┼──────────────┬───────────────┐
     ▼              ▼              ▼               ▼
  Snooze Conv   Hold/Resume    Room Reminder   RLT policy
     (0%)        header(0%)      (0%)           final

        ┌─────────────────────────────┐
        │  F-02 Reopen definition +    │  ← lock DULU
        │  F-05 FRT start + SLA mode   │
        └───────────┬─────────────────┘
                    │ blocks
              SLA reporting yang comparable
                    │
                    ▼
              Analytics / breach alert / CSAT SLA

        ┌─────────────────────────────┐
        │  Presence def + Round Robin  │  ← lock DULU
        └───────────┬─────────────────┘
                    │ blocks
              Auto-reply (0%)  +  Queue expansion
```

### 6.2 Broadcast room paradox (F-04)

```
Broadcast ke kontak TANPA room
        │
        ▼
  US-2 negatif: "create room silently"
        │
        ▼
  mode = REPLY_ONLY  ──►  room HIDDEN dari Inbox
        │
        ▼
  Customer BALAS
        │
        ▼
  Balasan masuk room yang agent tak tahu ada
        │
        ▼
  ⚠️ conversation "hilang" / SLA jalan diam-diam
```

### 6.3 Severity heatmap per modul

```
              Catastrophe  Major   Medium   Low
Conversation      ██          ███     ██      ·
Ticket             ·           ·       █      ·
Broadcast          ·          ██       █      ·
WA Web             ·           ·       ·       █
```

---

## 7 | Rekomendasi Prioritas (urutan eksekusi)

1. **Lock SLA pause matrix `[F-01]`** — 1 meeting PM+Eng, isi tabel §1.1 penuh. Membuka 4 fitur backlog.
2. **Lock reopen + FRT start + SLA mode** `[F-02, F-05, SLA-mode]` — hentikan akumulasi utang data metrik.
3. **Fix SLA color threshold FE** `[F-03]` — quick win, correctness + UX sekaligus, kemungkinan diff kecil di FE.
4. **Tutup Broadcast room paradox `[F-04]` di PRD** sebelum REPLY_ONLY dipakai produksi.
5. **Verifikasi idempotency broadcast server-side `[4.4]`** sebelum broadcast volume besar.
6. **Akui gap anti-spam `[4.2]`** ke stakeholder; jangan jual kapabilitas yang belum ada.
7. Sisanya (UX consistency, Collections, Bulk Scan) — backlog normal, non-blocking.

---

## 8 | Next Action

- Item 1–2 butuh keputusan PM+Engineering (bukan hal yang bisa diputuskan analis sendiri) → jadwalkan decision meeting.
- Item 3 & 5 bisa langsung jadi ticket engineering.
- Audit ini desk-based; item ⚠️ (F-03 FE, F-06 FE, idempotency BE, anti-spam BE) perlu **cross-check repo** untuk konfirmasi status sebelum masuk keputusan rilis. Kalau mau, lanjut audit fase-2 dengan pembacaan kode.
