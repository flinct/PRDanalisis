# SatuInbox — Executive Brief: Audit Temuan & Production Readiness

> **Untuk:** Manajemen  
> **Tanggal:** 2026-09-03  
> **Oleh:** Dany Christian (PM) / Naftal Yunior (Eng Lead)  
> **Status:** ⚠️ **BELUM SIAP PRODUKSI** — ada blocker yang harus diselesaikan sebelum go-live

---

## 1. Ringkasan Eksekutif

Audit sistem SatuInbox memakai memory FE/BE sebagai patokan utama dengan branch operasional `prod-2.8.1`, mencakup keamanan, integritas data, performa, UX, dan infrastruktur DevOps.

**Temuan utama:** Arsitektur sistem **solid** (20 microservice, gRPC+mTLS, MongoDB 8.0, RabbitMQ), tapi **kematangan operasional** masih di bawah standar produksi. Risiko bukan di desain, tapi di eksekusi operasional — secret bocor, zero alerting, zero test coverage di FE, dan single point of failure di beberapa service kritis.

---

## 2. Angka Kunci

| Metrik | Jumlah |
|--------|--------|
| **Register kanonik** | **101 finding** — single source of truth; corpus bruto masih overlap dan dibaca via reading-list |
| **Blocker (Catastrophe)** | **2** — SLA 3-way conflict + reopen behavior undefined |
| **Critical infra (harus fix minggu ini)** | **10** — committed secrets, zero alerting, SPOF gateway, CORS wildcard |
| **Major / blocking teknis tambahan** | **22+** — termasuk CSN-01 sidebar RBAC, CLH-02/03 conversation-list, broadcast idempotency, PII leakage, error mapper, no load test |
| **Kontrol positif (sudah benar)** | **10** — RBAC BE, HMAC webhook, DLQ broadcast, PII masking, SonarQube |
| **Corrected / false alarm penting** | **2** — FS-05 (DLQ exists), CLH-18 (bulk RBAC tetap enforced di BE; gap FE cuma visibility cosmetic) |
| **Coverage audit** | ~60% aspek Conversation ter-audit; ~40% belum (SLA engine, multi-tenant READ, observability) |

---

## 3. Top 5 Risiko Bisnis

### 🔴 1. Credential Bocor di Git (TIME-SENSITIVE)
**Apa:** Password database dan API key tertulis di file yang masuk ke git (`docker/local/.env`, `docker/dev/docker-compose.yml`).  
**Dampak:** Siapa pun yang punya akses repo = punya akses database.  
**Fix:** Hapus dari git + rotate semua credential. **30 menit.**

### 🔴 2. SLA Engine Belum Diverifikasi vs Contract
**Apa:** Sistem SLA (First Response Time, Resolution Time) adalah **load-bearing untuk billing dan reporting**, tapi kode belum diaudit apakah menghitung sesuai contract yang didefinisikan PRD. Ada 2 definisi SLA yang saling bertentangan di PRD.  
**Dampak:** Jika SLA salah hitung → agent performance report salah → keputusan bisnis berdasarkan data keliru.  
**Fix:** Decision meeting PM + Eng untuk lock definisi kanonik. **1 meeting.**

### 🔴 3. Zero Alerting = Buta di Produksi
**Apa:** Prometheus terpasang tapi tidak ada alert rule. Tidak ada yang dapat notifikasi jika service down, database error, atau queue backlog.  
**Dampak:** Customer menemukan masalah duluan, bukan tim.  
**Fix:** Tambah alert rule dasar (pod down, DB error, gRPC failure). **1 hari.**

### 🟡 4. API Gateway Single Replica (SPOF)
**Apa:** API Gateway = satu-satunya entry point HTTP/WebSocket, hanya 1 replica.  
**Dampak:** 1 pod crash = **total outage** untuk semua tenant.  
**Fix:** Scale ke minimum 2 replica + HPA. **1 jam.**

### 🟡 5. Frontend Zero Test Coverage
**Apa:** 1 test file untuk 1,777 source file FE. Tidak ada test runner.  
**Dampak:** Setiap perubahan FE = risiko regression yang tidak terdeteksi.  
**Fix:** Tambah Vitest + critical-path tests. **1-2 hari.**

---

## 4. Apa yang Sudah Bagus (Jangan Disentuh)

| Kontrol | Status |
|---------|--------|
| RBAC area context (Sales/Op/Admin) enforced di BE gateway | ✅ Verified |
| Webhook signature HMAC enforced (Messenger, IG, WA) | ✅ Verified |
| Broadcast DLQ + retry mechanism ada | ✅ Verified |
| PII masking di export, contact list, broadcast | ✅ Verified |
| Message edit/delete RBAC enforced server-side | ✅ Verified |
| SonarQube quality gate aktif di CI | ✅ Verified |
| Arsitektur microservice + gRPC+mTLS | ✅ Solid |
| HPA+VPA+Spot instance mix di infra | ✅ Solid |

---

## 5. Keputusan yang Dibutuhkan dari Manajemen

| # | Keputusan | Kenapa Blocker | Pemilik |
|---|-----------|----------------|---------|
| 1 | **Branch baseline** — target operasional sekarang `prod-2.8.1`; memory FE/BE jadi patokan utama | ENV-01 sudah resolved. Ticket boleh lanjut; re-verify hanya jika area berubah di 2.8.1. | Naftal |
| 2 | **Jadwalkan decision meeting SLA** — lock definisi Hold/Snooze/SLA + reopen behavior | 2 Catastrophe blocker. Bukan bug — ini keputusan bisnis yang belum diambil. Block 4+ fitur. | Dany + Naftal |
| 3 | **Alokasi resource untuk fix Week 1** (6 item, ~3 hari total) | Credential rotation + CORS fix + alerting + gateway scale + SSL + backup verify. | Naftal |

---

## 6. Roadmap Effort

| Fase | Durasi | Item | Total Effort |
|------|--------|------|-------------|
| **Week 1 — Stop the Bleeding** | 7 hari | Credential rotation, CORS fix, alerting, gateway scale, SSL, backup verify | **~3 hari kerja** |
| **Month 1 — Harden** | 30 hari | NetworkPolicy, MongoDB TLS, circuit breaker, FE tests, BE integration tests, EKS private access | **~15 hari kerja** |
| **Quarter 1 — Mature** | 90 hari | Distributed tracing, per-service docs, CHANGELOG, canary deploy, rate limit tuning | **~20 hari kerja** |
| **Backlog** | Ongoing | 16 confirmed non-priority (C1–C16) + 8 Track G confirmed (CSN) + 16 Track H confirmed (CLH) + 31 needs-validation + Track B/D/E/F non-critical fold | TBD (butuh dedup dulu) |

**Total estimasi untuk production-ready (Week 1 + Month 1): ~18 hari kerja engineering.**

---

## 7. Catatan untuk Presentasi

1. **Jangan panik.** Arsitektur solid, kontrol positif ada (10 item). Ini masalah kematangan operasional, bukan desain yang salah.
2. **Secret bocor = prioritas #1.** Ini time-sensitive — setiap hari credential tidak di-rotate = risiko aktif.
3. **SLA = keputusan bisnis, bukan bug.** Manajemen harus putuskan definisi sebelum engineering bisa fix.
4. **Angka corpus bruto** bukan berarti sistem jelek — itu hasil audit menyeluruh yang mencakup 7 track berbeda. Banyak overlap antar-track; register kanonik saat ini 101 finding.
5. **Coverage belum 100%.** ~40% aspek Conversation belum di-audit (SLA engine, multi-tenant READ-path, observability, mobile). Audit lanjutan direkomendasikan.

---

## 8. Sumber Data

| Dokumen | Isi |
|---------|-----|
| `01-audit-master-register.md` (v1.9) | Register kanonik — 101 finding, single source of truth |
| `2026-09-02-satuinbox-comprehensive-system-audit-master.md` | Narasi lengkap + roadmap 30/60/90 |
| `detail-infra/satuinbox-infra-audit.md` | Track F — 69 temuan infra/DevOps; 10 Critical sudah folded ke register |
| `detail-conversation/` | Track D/E raw + Track G sidebar-navigation (CSN) + Track H conversation-list (CLH); G/H sudah folded ke register |
| `Satuinbox - UI_UX Audit Report.md` | Track B — 33 temuan UX heuristic |
| `2026-09-03-conversation-audit-coverage-gap-check.md` | Coverage gap analysis — verdict PARTIAL |

---

*Disiapkan oleh Hermes Agent atas dasar audit corpus `Assessments/audit/`. Semua temuan `confirmed` punya bukti kode (file:line). Temuan `needs-validation` = inference dari PRD/memory, belum verifikasi kode.*
