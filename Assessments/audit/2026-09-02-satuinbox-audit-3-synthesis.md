> **FLAG: SYNTHESIS / AUDIT SATUINBOX-3**
> Membandingkan bukti code-verified terhadap kriteria kanonik (register). Register tetap menang untuk prioritas/status; dokumen ini menandai gap & aksi.

# SatuInbox — Audit-3 Synthesis: Evidence vs Canonical Register

| Item | Detail |
|---|---|
| **Tanggal** | 2026-09-02 |
| **Task** | t_ba1b1ec2 (synthesis) — root t_45379876 "audit satuinbox - 3" |
| **Canonical** | `audit-master-register.md` v1.1 (60 findings, source of truth) |
| **Evidence** | `2026-09-02-satuinbox-audit-security-integrity-integration-code-verified.md` (20 items code-verified, 3 sumbu SEC/DI/INT) |
| **Baseline** | BE `prod-2.7.0`, FE `prod-2.7.0-11` |
| **Owner** | PM = Dany Christian, Eng Lead = Naftal Yunior |

---

## 1 | Verdict

**PROCEED_WITH_CAUTION** — gated by **ENV-01 (HOLD_FEATURE)**.

7 confirmed code-bugs siap jadi ticket, tapi **branch target harus di-lock dulu** (repo `prod-2.7.0` vs memory `v2.8.0`). Semua status `confirmed` valid HANYA untuk `prod-2.7.0`. Ticketing di-hold sampai target branch final.

---

## 2 | Evidence ↔ Register Traceability

Setiap item confirmed di register punya bukti file:line di evidence doc. Semua 8 prioritas + 10 kontrol positif tervalidasi silang. **Tidak ada temuan confirmed tanpa bukti.**

| Register | Evidence citation | Match |
|---|---|---|
| DI-01 (idempotency broadcast) | `broadcast.proto` + `broadcast.service.ts:createBroadcast()` | ✅ |
| SEC-02 (contact phone non-unique) | `client-contact.schema.ts:101` | ✅ |
| DI-04 (no atomic merge) | grep `merge.*contact` absence | ✅ |
| SEC-04 (audit hanya Open API) | `audit-service/src/main.ts` + `app.module.ts` | ✅ |
| INT-03 (DLQ fallback non-TLS) | `broadcast-dlq.processor.ts:120` | ✅ |
| SEC-01 (console.log PII) | `whatsapp-api.controller.ts:144` | ✅ |
| F-07 (raw error leak) | grep 278 call sites FE | ✅ (evidence FE terpisah) |
| P1-P10 (kontrol positif) | SEC-03/05/06/08, DI-02/03/05, INT-04/05 | ✅ |

---

## 3 | Gaps & Compliance Issues (temuan synthesis)

### G-1 — Status stale: V17/FS-04 `needs-validation` padahal sudah confirmed 🟡
Register V17 (FS-04) berstatus `needs-validation`, tapi kolom notes-nya sendiri bilang "INT-01/INT-02 sudah confirmed" dan evidence doc INT-01 mengkonfirmasi `GRPC_ANALYTICS_URL` config trap (`.env.example:77` vs `:91`, dua nilai berbeda) = **confirmed, bukan needs-validation**.
**Aksi:** promote bagian config-trap V17 ke `confirmed` (severity Medium, backlog seperti INT-02/C6). Sisakan hanya "no circuit breaker" yang sudah tercakup C6/INT-02 → V17 bisa di-close sebagai duplikat.

### G-2 — RetryTracker in-memory bukan baris register sendiri 🟡
Evidence DI-02 + register X1 (corrected FS-05) sama-sama catat: `retryTracker` = `Map` in-memory (`broadcast.processor.ts`), state retry hilang antar-restart → potensi retry tanpa batas. Ini **follow-up nyata**, bukan sekadar catatan koreksi.
**Aksi:** buat baris confirmed baru (mis. DI-06, Major/Medium) — persist retry count ke document broadcast atau AMQP `x-death` header. Jangan tinggal terkubur di catatan X1.

### G-3 — 26 needs-validation belum tersentuh evidence axis 🟠
Evidence doc code-verified hanya 3 sumbu (SEC/DI/INT, 20 item). 26 item `needs-validation` (SLA F-01..F-06, performance P-01..P-06, flow FS/FA, UX) **nol bukti kode** — masih inference PRD/memory.
**Aksi:** 2 jalur —
- **Decision-bearing (V1-V6: F-01/F-02 Catastrophe + SLA modes):** butuh decision meeting PM+Eng, BUKAN kode. REVISE_PRD/HOLD_FEATURE. Tidak boleh jadi engineering ticket sebelum policy di-lock.
- **Verifiable (V8-V26):** butuh grep cepat / index check / load test. Sebagian bisa ditutup 1 sprint verifikasi kode; sebagian (P-03/P-04/P-10 load test) butuh tooling (lihat C2/PERF-04: k6/artillery belum ada).

### G-4 — F-07 remediation surface 278 call sites 🔴
F-07 confirmed tapi blast radius besar (278 non-import calls, 132 files, 0 error mapper). Bukan quick fix.
**Aksi:** phased rollout — shared error mapper (`{code, messageKey, fieldErrors, retryable, correlationId}`) + FE i18n by code. Prioritaskan 5 negative-path flow inti dulu (acceptance test register item 7).

### G-5 — Fitur v2.8.0 tidak terverifikasi ⚪
relation-label, contact-sync, Atlas search (memory v2.8.0) **tidak diverifikasi** — di luar branch audit. DI-04 remediation (contact sync worker) menyinggung v2.8.0.
**Aksi:** bagian dari ENV-01 — jika target = v2.8.0, re-verify 7 prioritas + audit ulang 3 fitur ini.

---

## 4 | Actionable Register Patches

Diterapkan ke `audit-master-register.md` (register naik ke v1.2):

1. **V17/FS-04** → split: config-trap = `confirmed` (dup INT-01), close needs-validation part.
2. **Tambah DI-06** (baris confirmed non-prioritas): RetryTracker in-memory persist → document/AMQP header.
3. **Total** naik 60 → 61 (DI-06 baru), needs-validation 26 → 25 (V17 di-close/dup).

---

## 5 | Execution Order (post ENV-01 lock)

| Prioritas | Item | Alasan |
|---|---|---|
| **GATE** | ENV-01 | Lock branch target sebelum ticketing apa pun |
| P1 | DI-01 | Double-send massal, proto change build-breaking |
| P2 | SEC-02 + DI-04 | Constraint DB + upsert atomik, tutup merge race |
| P3 | SEC-04 | Compliance audit trail internal |
| P4 | INT-03 | Hard-fail mTLS, jangan downgrade diam-diam |
| P5 | SEC-01 | Quick win, zero regression |
| P6 | F-07 | Phased (278 sites), mulai 5 flow inti |
| P7 | INT-02 + INT-06 + DI-06 | Hardening async + persist retry state |
| BACKLOG | C1-C15 | PROCEED, severity lebih rendah |
| MEETING | V1-V6 | Decision PM+Eng (REVISE_PRD/HOLD_FEATURE), bukan ticket kode |

---

## 6 | Open Questions (carry-forward untuk reviewer/PM)

1. Branch target final: `prod-2.7.0` atau `v2.8.0`? (ENV-01, gate semua ticket)
2. `OPEN_API_REQUEST_LOGGED` di-publish untuk semua partner call atau subset? (SEC-04 scope)
3. SLA policy F-01 (Hold vs Snooze vs SLA) + F-02 (reopen definition): kapan decision meeting? (blocker Catastrophe)
4. Load test tooling (k6/artillery, C2) diadakan sebelum atau sesudah validasi V10/V11/P-10?

---

_Synthesis lengkap. Register menang untuk prioritas/status; patch di §4 harus diterapkan ke register agar status konsisten (G-1, G-2)._
