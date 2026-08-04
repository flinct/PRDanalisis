# Session Summary — 3 Task Pasca-ver2.8.0: Feasibility & Timeline

## Tanggal
2026-08-03

## Judul session
Feasibility & timeline 3 task pasca-ver2.8.0 (Mini Dashboard / E-Mail Summary / Exporting Report) + draft requirement

## Tujuan / request utama user
1. Cek kemungkinan implementasi 3 fitur setelah v2.8.0 (Mini Dashboard agent, E-Mail Summary pengganti webhook SAP, Exporting Report ala contoh Excel SAP) dengan resource 2 dev + 1 QA.
2. Kalau timeline yang diajukan tidak memungkinkan, buat timeline realistis, urutkan berdasarkan kompleksitas (dev + testing).
3. Buat draft requirement (Change Intake Brief) untuk 3 task.

## Ringkasan progres / analisa / keputusan penting

### Analisa feasibility (konteks produk)
- **Mini Dashboard:** data statistik agent sudah lengkap di `conversation_sla_metrics` (`frtMs`, `rltMs`, `ttcMs`, `waitTimeInQueueMs`, `firstAgentReplyAt`, `conversationClosedAt` — v2.5.0). Halaman statistik lengkap sudah ada (Member Performance, CSAT, Conversation analytics — `PRD/Analytics/`). Keputusan user: **tidak buat dashboard baru**, cukup grant permission agent ke halaman statistik existing (self-filtered). Impact ke conversation-service: **tidak ada** — halaman existing ditenagai analytics-service; hanya RBAC grant + self-filter.
- **E-Mail Summary:** infra transcript email sudah ada (`PRD/Transcript email/`, email service `:50066` IMAP/SMTP). Keputusan Q3 user: **email langsung berisi data yang bisa dipakai SAP** (bukan JSON/attachment). Menggantikan webhook SAP = behavior change kontrak eksternal — jalur kritis, diskusi format dengan SAP harus mulai parallel sejak sprint 1.
- **Exporting Report:** 90% sudah ada — Offline Report Download (`PRD/Analytics/PRD Analytics - offline report download.md`) + Ticket Export XLSX. Contoh file SAP (47.5MB, 4 sheet): Report Ticket 35 kolom / Report Conversation 27 kolom / Report Effective Hour 6 kolom / Raw AUX 9 kolom. Keputusan Q1: **general untuk semua customer**, template SAP sebagai opsi di halaman export existing.

### Complexity ranking
1. Exporting Report — dev Low (reuse infra), testing Medium-High (volume 169k+88k baris, data incremental harian)
2. Mini Dashboard (permission route) — dev Low (RBAC + self-filter), testing Medium (data leak check antar agent)
3. E-Mail Summary — dev High (email infra + kontrak baru), testing High (email real + iterasi SAP)

### Timeline final (per versi, mulai 17 Aug)
- **ver2.8.0**: release existing, naik **sebelum 17 Aug**
- **ver2.8.1** (17 Aug – 28 Aug): **Mini Dashboard** — permission agent ke halaman statistik existing + self-filter RBAC → release 28 Aug
- **ver2.8.2** (31 Aug – 18 Sep): **Exporting Report** — template SAP 4-sheet di Offline Report Download (3 minggu: testing butuh data incremental) → release 18 Sep
- **ver2.8.3** (21 Sep – 2 Okt): **E-Mail Summary** — email summary saat close, ganti webhook SAP (kontrak SAP parallel sejak sekarang) → release 2 Okt
- Total 7 minggu, 3 release berurutan. Catatan: tukar urutan export & dashboard (dashboard = permission saja, cepat; export butuh window testing panjang).

### Artifact yang dibuat (Change Intake Brief Phase 0, per template `Assessments/templates/Setup/change-intake-brief-template.md`)
1. `Assessments/cross-domain/agent-statistic-access/agent-statistic-access-change-intake-brief.md` — ADDITIVE_IMPROVEMENT, ROUTE_PATCH_EXISTING_PRD (Analytics)
2. `Assessments/cross-domain/sap-report-export/sap-report-export-change-intake-brief.md` — ADDITIVE_IMPROVEMENT, ROUTE_PATCH_EXISTING_PRD (Offline Report Download), 4-sheet spec + open questions
3. `Assessments/cross-domain/email-summary-customer/email-summary-customer-change-intake-brief.md` — MIXED_REQUEST (BEHAVIOR_CHANGE webhook→email + additive), ROUTE_PATCH_EXISTING_PRD (Transcript email)

## Status terakhir / next step
3 brief v1.0 dibuat, status Draft. Next step: user jawab blocking open questions per brief (format email SAP, RBAC agent export, mapping kolom stage duration, dll), lalu lanjut patch PRD masing-masing. Jalur kritis: diskusi format email dengan SAP.

## Transkrip percakapan lengkap

### Turn 1 — User
> Mini Dashboard, agent dashboard yang menampilkan statistic agent pribadi, dari aspek FRT, RLT, wait time, TTC, CSAT, saran allow permission ke halaman statistic yang sudah aada
> 
> E-Mail Summary, summary percakapan email yang akan dikirim ke email customer setelah conversation ditutup, sudah ada webhook untuk di proses oleh pihak SAP, tetapi pihak SAP meminta solusi lain agar mereka tidak perlu memproses webhook tsb
> 
> Exporting Report, export report berdasarkan filter yang di pilih user, bisa adaptasi dari screenshot dari kapture, atau contoh excel ini > @file:`.hermes/desktop-attachments/SatuInbox_SAP_Report_31_07_2026.xlsx`
> 
> Dashboard, kemungkinan Timeline nya 15 Agustus - 30 Agustus.
> E-Mail Summary, kemungkinan Timeline nya 1 September - 15 September.
> Exporting Report (yang biasa di provide mas rayyan, pengen dibuat sudah ready di sistem dan tinggal download, kemungkinan Timeline nya 1 September - 15 September.
> 
> jika 3 hal di atas akan di implement setelah v2.8.0
> cek secara posibilitas nya, lalu lihat secara human resource yang hanya ada 2 dev 1 qa, memungkinkan atau tidak
> jika timeline yang di ajukan di atas tidak memungkinka, buat timeline yang masuk akal, urutkan juga berdasarkan complexcity nya,dari segi dev dan testing

### Turn 2 — Assistant
Analisa feasibility: konteks ditemukan (SLA metrics, Analytics PRD, export infra, transcript email), verdict timeline tidak realistis, complexity ranking (Export Low, Dashboard Medium, Email High), usulan timeline 6 minggu, open questions Q1-Q3.

### Turn 3 — User
> buat timeline dimulai dari tanggal 17-08
> q1, dibuat general untuk semua
> q2, secara dev cepat mana? mini dashboard nanti nambah endpoint baru lagi ga? trus nambah beban ke conversation service lagi ga, jika lebih aman memberi permission ke halaman statistic yang ada, saya prefer itu, liat juga nanti jika diberi permission ke halaman statistic yang ada impact nya apa ke conversation service
> q3, seharusnya langsung email yg dapat dikirim ke customer mereka

### Turn 4 — Assistant
Q1: export general — template SAP sebagai opsi. Q2: permission ke halaman existing jauh lebih cepat (rasio 1:4 vs dashboard baru); endpoint baru hanya kalau dashboard baru (beban ke analytics-service, bukan conversation-service); impact permission = RBAC grant + self-filter + data leak check, conversation service tidak kena kecuali real-time FRT/TTC yang sudah jalan. Q3: email langsung berisi data SAP — kontrak baru, butuh konfirmasi format. Timeline 17 Aug: Sprint 1 Export (17-28 Aug), Sprint 2 Dashboard (31 Aug-11 Sep), Sprint 3 Email (14-25 Sep).

### Turn 5 — User
> saya lebih prefer export dan dashboard di tukar timeline nya
> karna tidak ada penambahan mini dashboard baru, hanya menambah allowance permission agent untuk melihat statistic, yg sebelumnya agent tidak bisa melihat statistic
> 
> lalu untuk export statistic perlupenambahan waktu, karna testing memerlukan dataa increment setiap harinya

### Turn 6 — Assistant
Timeline ditukar: Sprint 1 Dashboard (17-28 Aug, release 28 Aug), Sprint 2 Export 3 minggu (31 Aug-18 Sep, release 18 Sep, QA butuh data incremental), Sprint 3 Email (21 Sep-2 Okt, release 2 Okt). Total 7 minggu. Risiko export mepet → mitigasi: mulai kumpulkan data sejak release dashboard.

### Turn 7 — User
> ubah text sprint menjadi ver
> ver2.8.0 naik sebelum tanggal 17
> next buat ver2.8.1 dst

### Turn 8 — Assistant
Timeline per versi: ver2.8.0 (sebelum 17 Aug), ver2.8.1 (17-28 Aug, Mini Dashboard, release 28 Aug), ver2.8.2 (31 Aug-18 Sep, Exporting Report, release 18 Sep), ver2.8.3 (21 Sep-2 Okt, E-Mail Summary, release 2 Okt). Catatan jalur kritis kontrak SAP.

### Turn 9 — User
> buat draft requirement untuk 3 task tadi

### Turn 10 — Assistant
Dibuat 3 Change Intake Brief v1.0 di `Assessments/cross-domain/` (agent-statistic-access, sap-report-export, email-summary-customer). Masing-masing berisi request snapshot, klasifikasi, current state verification, scope boundary, impact flags, routing decision (semua ROUTE_PATCH_EXISTING_PRD), blocking questions, approval targets, downstream reuse map.
