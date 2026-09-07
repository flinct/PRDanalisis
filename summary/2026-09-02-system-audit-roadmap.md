# 2026-09-02 — SatuInbox System Audit Roadmap

## Tujuan

Menjawab bagaimana melakukan audit menyeluruh SatuInbox, termasuk cakupan selain performance, flow sistem, flow aplikasi, dan UX.

## Ringkasan

- Klasifikasi: discovery dan impact/risk analysis; tidak ada perubahan perilaku produk atau keputusan rilis yang dibuat.
- Baseline yang relevan sudah ada: `Assessments/audit/2026-09-01-satuinbox-system-audit.md`, berupa audit desk-based dengan 16 temuan.
- Rekomendasi: jadikan audit lama sebagai Fase 0, lalu lakukan audit berbasis bukti dalam workstream: correctness/flow, performance & reliability, security/RBAC/privacy, data/integrity, integrations & delivery, operations/observability, UX/accessibility, QA/release readiness, dan commercial/compliance bila relevan.
- Fokus awal yang sudah teridentifikasi: keputusan SLA pause, reopen, FRT start/SLA mode; kemudian SLA color FE, paradox room Broadcast, serta idempotency dan anti-spam Broadcast.

## Status / Langkah Berikutnya

Roadmap audit disampaikan. Jika user menyetujui, langkah aman berikutnya adalah membentuk audit charter dan evidence plan, lalu memulai discovery read-only per domain tanpa mengubah sistem.

## Transkrip Verbatim

### Turn 1 — User

> apa yang harus dilakukan untuk melakukan audit sistem?
> saya mau audit sistem satuinbox secara keseluruhan
> yang saya pikir perlu diaudit
> performance
> flow sistem
> flow aplikasi
> UX
>
> ada saran lain?
> harus bagaimana auditnya

### Turn 1 — Assistant

Audit menyeluruh SatuInbox sebaiknya dilakukan sebagai **audit berbasis bukti**, bukan satu kali review UI atau benchmark performance. Empat area Anda tepat; tambahkan reliability, security/RBAC/privacy, data integrity, integrasi, observability/operasional, QA/release readiness, dan—bila relevan—compliance serta biaya operasi.

Baseline-nya sudah ada di `Assessments/audit/2026-09-01-satuinbox-system-audit.md`: audit desk-based dengan 16 temuan. Gunakan itu sebagai Fase 0, lalu validasikan ke implementasi dan lingkungan nyata.

Mulai dengan audit charter: tujuan, modul prioritas (Conversation, Ticket, Broadcast, WhatsApp Web, Contact, Auth, Analytics), lingkungan dan periode data yang aman, owner evidence, definisi severity, dan aturan bahwa pengujian beban/keamanan tidak menyentuh produksi tanpa persetujuan. Buat inventaris arsitektur dan dependency: service, database/collection, API/gRPC, RabbitMQ, Socket.IO, third-party WhatsApp, cache, dashboard, alert, dan job background.

Jalankan workstream berikut secara paralel secara terstruktur: flow/correctness; performance/reliability; security/RBAC/privacy; data and integration integrity; observability/operations; UX/accessibility; QA/release readiness. Setiap temuan harus memuat bukti, dampak, severity, owner, mitigasi, regression scope, dan cara verifikasi perbaikan.

Prioritas awal dari baseline: (1) lock matriks SLA Hold/Snooze/AUX/Waiting on Customer; (2) satu definisi canonical untuk reopen, FRT start, dan SLA mode; (3) cross-check SLA color di FE terhadap PRD; (4) tutup paradox room Broadcast REPLY_ONLY; (5) verifikasi idempotency dan anti-spam Broadcast di server sebelum volume besar.

Deliverable yang disarankan: audit charter, system/flow map, evidence register, risk & finding register, performance baseline, UX journey report, security/RBAC matrix, test coverage and release-readiness report, lalu audit report dan remediation roadmap 30/60/90 hari. Jangan mulai dari semua detail sekaligus: 1 minggu discovery/read-only, 2 minggu pengukuran dan journey test, 1 minggu validasi serta workshop prioritas sudah cukup untuk baseline pertama.

### Turn 2 — User

> review ulang hasl audit tersebut
>
> keyword saya kemarin 
>
> 1. miss flow
> 2. UX tidak baik
> 3. feature yang kurang matang dan sudah developed
>
> menghasilkan analisis teresebut

### Turn 2 — Assistant

Ya—secara struktur, laporan audit 1 September memang dihasilkan dari tiga keyword itu, dan pemetaannya konsisten:

| Keyword Anda | Bagian laporan | Isi |
|---|---|---|
| Miss flow | §1 | 6 temuan: konflik SLA pause, tiga definisi reopen, paradox Broadcast, mismatch presence/auto-reply, attribution ticket, dan Round Robin tanpa PRD. |
| UX tidak baik | §2 | 5 temuan: unread/filter, model navigasi Conversation vs Ticket, warna SLA, istilah Close/Resolve, dan tidak ada autosave Broadcast. |
| Feature kurang matang tetapi sudah developed | §3 | 7 gap, termasuk warna SLA, definisi FRT, FRT group chat, RLT/Wait Time, Custom Attributes, Bulk Scan QR, dan SLA mode. |

Kualitas analisisnya baik sebagai **desk audit produk/PRD**: menemukan konflik aturan, menjelaskan dampak bisnis, serta memberi urutan perbaikan yang masuk akal. Tiga prioritas utamanya—kebijakan SLA, definisi reopen/FRT/SLA mode, lalu Broadcast—tepat karena merupakan decision node yang memblokir banyak fitur lain.

Namun, hasilnya belum boleh disebut audit sistem menyeluruh atau dipakai langsung sebagai keputusan rilis. Ada empat kekurangan penting:

1. **Performance tidak diaudit.** Tidak ada metrik latency, throughput, error rate, RabbitMQ backlog, Socket.IO reconnect, query database, atau load test. Ini belum menjawab keyword performance yang Anda sebutkan kemudian.
2. **Bukti implementasi belum tervalidasi.** Laporan sendiri menyatakan tidak membaca repo FE/BE; label developed/partial berasal dari snapshot memory. Maka F-03, F-06, idempotency Broadcast, dan anti-spam adalah hipotesis kuat yang perlu code/environment verification.
3. **Cakupan tidak benar-benar seluruh sistem.** Conversation dan Broadcast dominan; Ticket hanya sedikit, sedangkan WhatsApp Web, Contact, Auth/RBAC, Analytics/reporting, integrasi, operasi/monitoring, dan data integrity belum menerima coverage yang sebanding.
4. **UX masih heuristic, belum tervalidasi pengguna.** Tidak ada task-based usability test, sample agent/supervisor, waktu penyelesaian, error rate, atau evidence session replay. Jadi temuan UX layak diprioritaskan, tetapi belum terukur.

Putusan review saya: **PROCEED_WITH_CAUTION**. Pertahankan laporan sebagai *Fase 0: product/PRD audit baseline*, bukan final system audit. Jangan mengubah severity menjadi fakta implementasi sebelum verifikasi.

Revisi paling penting pada laporan berikutnya adalah menambahkan kolom `Evidence Type` (PRD / source code / log / metric / usability test), `Verification Status`, dan `Affected Version/Environment`. Lalu lakukan Fase 1 secara read-only: verifikasi 16 temuan ke FE/BE dan environment; Fase 2: performance/reliability + security/RBAC/data/integration; Fase 3: usability test dan remediation roadmap. Dengan itu, tiga keyword awal tetap menjadi struktur utama—bukan diganti—tetapi didukung bukti operasional yang cukup.

### Turn 3 — User

> cari soal message error
> seharusnya banyak message error yg tidak human readable

### Turn 3 — Assistant

Ditemukan pola sistemik yang mendukung dugaan Anda: SatuInbox berisiko menampilkan pesan teknis atau berbahasa backend secara langsung kepada pengguna.

**Bukti implementasi:**

- Helper bersama `packages/react-query/src/helpers/throw-service-error.ts` membuat `ServiceError` memakai `error.response.data.message` apa adanya. Ada **248 pemanggilan** helper ini di dashboard FE, sehingga pesan backend berpotensi mengalir luas ke UI.
- Ditemukan **49 sink langsung** yang memakai `err.message`/`error.message` sebagai deskripsi toast atau error state. Contoh ada pada action Ticket Snooze, perubahan stage Ticket, hapus channel Instagram, autentikasi, upload media, notes Conversation, dan koneksi socket.
- Bahkan ketika ada fallback terjemahan, beberapa kode memakai `err.message || terjemahan`. Artinya fallback hanya dipakai bila backend sama sekali tidak mengirim pesan; bila backend memberi `validation failed`, `Internal Server Error`, atau pesan Inggris/teknis lain, teks mentah tetap tampil.
- Ada `ERROR_MESSAGES` lokal berisi string teknis berbahasa Inggris seperti `Failed to fetch responsiveness chart average first response time`. Ini bukan bahasa yang dapat dipahami agent dan tidak melewati i18n.
- Terdapat sekitar **305** pemanggilan toast di FE, tetapi belum terlihat satu boundary bersama yang menjamin seluruh error menjadi pesan yang human-readable dan terlokalisasi.

Contoh konkret: Ticket Snooze memprioritaskan `err.message` di atas teks terjemahan; action update stage Ticket dan delete channel Instagram menampilkan `err.message` langsung. Socket error juga menyimpan `err.message` apa adanya; ini dapat mengungkap pesan transport/backend atau membuat agent tidak tahu langkah pemulihan.

Temuan audit yang disarankan:

| ID | Temuan | Severity | Mengapa |
|---|---|---|---|
| F-07 | Raw backend error leakage dan error copy tidak terstandardisasi | High | Mengganggu pemulihan user, membuat UI bilingual/teknis, dan dapat membuka detail internal. |

Rekomendasi perbaikan bukan mengganti 49 titik satu per satu terlebih dahulu. Buat satu error boundary/mapper bersama: backend mengirim `code`, `messageKey`, `fieldErrors`, `retryable`, dan `correlationId`; FE memetakan hanya `code/messageKey` ke i18n. Pesan mentah dicatat bersama correlation ID untuk support, tetapi tidak ditampilkan ke user. Pesan validasi yang memang aman bisa di-whitelist. Fallback harus spesifik aksi, misalnya “Gagal memperbarui status tiket. Periksa koneksi lalu coba lagi.”, bukan “Unexpected Error”.

Prioritas verifikasi berikutnya: jalankan negative-path test untuk login, kirim pesan/socket terputus, assignment/close/reopen Conversation, update/snooze Ticket, upload media, dan Broadcast; catat teks yang benar-benar muncul pada UI, API error code, dan apakah user diberi langkah selanjutnya.

### Turn 4 — User

> review auditnya C:\Users\MyBook SAGA 12\Desktop\PRDanalisis\Assessments\audit

### Turn 4 — Assistant

Status paket audit: **REVISE_AUDIT_PACKAGE**. Isi analisisnya kuat, tetapi paketnya belum aman dijadikan satu sumber keputusan atau backlog eksekusi karena belum terkonsolidasi.

Artefak yang paling bernilai adalah `2026-09-02-satuinbox-audit-security-integrity-integration-code-verified.md`: ia memisahkan evidence kode, branch/environment (`prod-2.7.0`), kontrol positif, dan status verifikasi. Ini mengonfirmasi idempotency Broadcast memang belum ada, contact phone belum unik, audit trail internal belum tercakup, dan DLQ consumer dapat turun ke non-TLS.

Namun ada masalah paket penting:

1. `2026-09-01-satuinbox-system-audit.md` dan extension performance/flow UX adalah desk analysis; banyak item berlabel inference, tetapi tidak memiliki register konsolidasi untuk membedakan asumsi, terverifikasi, terbantahkan, atau ditutup.
2. Extension masih memuat FS-05 “tanpa DLQ” sebagai risiko, padahal audit code-verified mengoreksinya: DLQ dan retry Broadcast ada. Dokumen asal perlu diberi status superseded/corrected agar backlog tidak salah.
3. Scope “semua modul” belum didukung bukti merata. Conversation dan Broadcast dominan; Ticket, WA Web, Contact, Auth, Analytics, observability, dan operation tidak dicakup sedalam itu. Dokumen `Audit Breakdown` hanya knowledge draft, bukan evidence audit.
4. Severity tidak seragam: audit utama memakai Catastrophe/Major/Medium, UI/UX memakai Nielsen 0–4, sementara extension dan code audit memakai Major/Medium. Tidak ada satu risk register yang menentukan prioritas final.
5. Semua laporan baru masih Draft, tanpa owner per temuan, target release, acceptance criteria, status remediation, dan test/rollback evidence. Status branch pun berbeda: desk baseline bergantung memory v2.8.0, code audit diverifikasi pada prod-2.7.0.
6. Temuan F-07 raw error leakage yang baru ditemukan belum masuk paket audit. Bukti: central error helper meneruskan `response.data.message` mentah pada 248 penggunaan dan ada 49 sink toast/state error langsung memakai `err.message`/`error.message`.

Rekomendasi: jangan menulis ulang seluruh audit. Buat satu `Audit Master Register` sebagai sumber prioritas, lalu berikan status pada tiap finding: `confirmed`, `inference`, `corrected`, `closed`, atau `needs-validation`. Jadikan DI-02 sebagai corrected untuk FS-05; masukkan F-07 sebagai UX/Security; pecah temuan per environment/release; dan tambahkan owner, due date, bukti, target acceptance test, serta rollback/monitoring. Setelah konsolidasi, hanya temuan `confirmed` atau yang punya risiko produk eksplisit yang boleh masuk backlog prioritas.

Prioritas confirmed sekarang: idempotency Broadcast, uniqueness/upsert contact, internal audit trail, hard-fail mTLS di DLQ, penghapusan PII console log, dan error-message normalization. Sementara performance/socket/SLA-ordering tetap penting, tetapi harus ditandai discovery/load-test sampai bukti kode atau metrik tersedia.
