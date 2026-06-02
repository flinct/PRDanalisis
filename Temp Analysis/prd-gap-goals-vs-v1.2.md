# Gap Analysis: Goals vs PRD Account Channel Event Log v1.2

> **Type:** Goals-to-PRD Coverage Gap Analysis
> **Source:** User goals statement + PRD v1.2
> **Rules Applied:** `qa-analysis-rule.md`, `impact-analysis-rule.md`
> **Tanggal:** 2026-06-02

---

## 1. Goals yang Dinyatakan

User menyatakan PRD harus mencakup:

| # | Goal Event | Deskripsi User |
|---|-----------|----------------|
| G-01 | `CREATED` | Account channel dibuat |
| G-02 | `INIT` | Instance diinisialisasi pertama kali |
| G-03 | `SCAN` | QR di-scan |
| G-04 | `CONNECTED` | Account berhasil connected |
| G-05 | `LIFETIME` | Dari account berhasil connect hingga status berubah not connected (disconnect atau suspend) |
| G-06 | `DISCONNECTED` | Koneksi terputus |
| G-07 | `SUSPENDED` | Account disuspend |
| G-08 | `RE_INIT` | Event ketika session tidak ready tapi DB masih menyimpan data session-nya |

---

## 2. Coverage PRD v1.2 vs Goals

| Goal | PRD v1.2 Coverage | Status | Gap |
|------|------------------|--------|-----|
| G-01 CREATED | FR-001, Section 5 | ✅ Covered | — |
| G-02 INIT | FR-002, Section 5 | ✅ Covered | INIT tidak dibedakan dari RE_INIT — setiap InitInstance() dicatat sebagai INIT |
| G-03 SCAN | FR-003, Section 5 | ✅ Covered | Pending OQ-003 (Baileys signal) |
| G-04 CONNECTED | FR-004, Section 5 | ✅ Covered | — |
| G-05 LIFETIME | FR-012, FR-013, Section 9.1 | ⚠️ Partial | Per-session sudah ada. "Until suspended" covered via AUTO_SUSPEND. OQ-004 belum resolved di PRD. |
| G-06 DISCONNECTED | FR-005, Section 5 | ✅ Covered | — |
| G-07 SUSPENDED | FR-006, Section 5 | ✅ Covered | Pending OQ-001 (action exists?) |
| **G-08 RE_INIT** | ❌ **Tidak ada** | **MISSING** | Event type RE_INIT tidak didefinisikan di PRD v1.2 sama sekali |

**Critical finding:** G-08 RE_INIT adalah event yang sepenuhnya absen dari PRD v1.2. Ini bukan sekedar gap kecil — RE_INIT mempengaruhi event taxonomy, state machine, session architecture, dan idempotency key design.

---

## 3. Definisi RE_INIT yang Benar

Berdasarkan klarifikasi user:
> "Event ketika account channel terindikasi session nya tidak ready, tetapi DB masih menyimpan data session-nya."

RE_INIT = trigger ketika:
- Credentials/session data akun **masih tersimpan di DB** (Baileys encrypted auth state)
- Tapi Baileys WebSocket session **tidak aktif / tidak ready**
- Sistem mencoba restore koneksi menggunakan credentials yang tersimpan — **tanpa perlu QR atau pairing baru**

### Perbedaan INIT vs RE_INIT

| Aspek | INIT | RE_INIT |
|-------|------|---------|
| Trigger kondisi | Tidak ada session data di DB / fresh account | Session data ada di DB, koneksi tidak aktif |
| Metode koneksi | QR scan atau Pairing Code diperlukan | Credential restore dari DB — tidak perlu QR |
| Siapa yang trigger | User (Admin klik Connect) atau System (first setup) | System (auto-restore saat service restart) atau User (admin trigger reconnect manual) |
| Diikuti SCAN? | Ya (jika QR method) | **Tidak** — tidak ada QR/scan, langsung ke CONNECTED atau DISCONNECTED |
| Contoh Baileys | `InitInstance` fresh, auth state kosong | Baileys load credentials dari DB, `restoreSession()` / auto-restore on startup |

### State Transition dengan RE_INIT

```
[CREATED / DISCONNECTED + credentials di DB]
        │
        ▼ RE_INIT (system: auto-restore / user: trigger manual reconnect)
[RESTORING]
        │
        ├─── Berhasil ──────▶ CONNECTED
        │
        └─── Gagal ─────────▶ DISCONNECTED (reason: CONNECTION_LOST / UNKNOWN)
                                    │
                                    └──▶ INIT (admin trigger fresh init dengan QR)

[CREATED / NO credentials]
        │
        ▼ INIT (first time, perlu QR)
[INITIALIZING]
        │
        ▼ SCAN
        │
        ▼ CONNECTED
```

---

## 4. Impact RE_INIT terhadap Seluruh PRD

### 4.1 Section 5 — Event Definitions (HARUS diupdate)

Tambahkan row baru:

| Event | Trigger | Actor | Description |
|-------|---------|-------|-------------|
| `RE_INIT` | Account channel session tidak ready tapi DB masih menyimpan session data. Sistem atau admin trigger restore koneksi menggunakan credentials yang tersimpan. | User or System | Berbeda dari INIT: tidak memerlukan QR atau pairing. Jika berhasil → CONNECTED. Jika gagal → DISCONNECTED. |

### 4.2 Section 7 FR — Functional Requirements (HARUS diupdate)

Tambahkan FR baru di kategori **Event Capture**:

`FR-032: System MUST record RE_INIT when a connection restore attempt starts using existing stored credentials, and no QR or pairing is required.`

Implikasi tambahan:
- `FR-027` (QR refresh tidak trigger SCAN) tetap berlaku dan secara implisit RE_INIT juga tidak trigger SCAN — **tambahkan eksplisit**: RE_INIT flow MUST NOT emit SCAN event.

### 4.3 Section 9 Field — `event_type` Enum (HARUS diupdate)

Tambahkan `RE_INIT` ke allowed values:
```
Allowed: CREATED, INIT, SCAN, CONNECTED, DISCONNECTED, SUSPENDED, RE_INIT
```

### 4.4 Section 9.2 — Idempotency Key Format (HARUS diupdate)

Tambahkan row:

| Event | Format |
|-------|--------|
| `RE_INIT` | `{accountChannelId}:RE_INIT:{requestId\|connectionAttemptId\|occurredAtUnixMs}` |

### 4.5 Section 9.4 — Metadata Whitelist (perlu review)

Key `trigger` sudah ada dengan values: `manual`, `auto_restore`, `reconnect`, `policy`.

Untuk RE_INIT:
- System auto-restore saat startup → `trigger: 'auto_restore'`
- Admin trigger manual reconnect dari UI → `trigger: 'manual'`
- Scheduled reconnect attempt → `trigger: 'reconnect'`

Key `connectionMethod` perlu ditambahkan value:
- `credential_restore` sudah ada di whitelist — ✅ cocok untuk RE_INIT flow

### 4.6 Section 9.1 — Connection Session Architecture (HARUS diupdate)

Tambahkan aturan untuk RE_INIT di session management:

| Step | Rule |
|------|------|
| RE_INIT start | RE_INIT MUST NOT create a new `connectionSessionId`. Session is only created when Baileys confirms `connection = open` (CONNECTED event). |
| RE_INIT success | Baileys emits `connection = open` → normal CONNECTED flow → new session created |
| RE_INIT failure | Baileys emits `connection = close` → DISCONNECTED as orphan (no active session) |

**Konsekuensi penting:** RE_INIT bisa terjadi tanpa sesi aktif sebelumnya (Redis session key tidak ada). Jika RE_INIT gagal, DISCONNECTED yang diemit tidak punya `connectionSessionId` → orphan. Ini sudah di-handle oleh rule "Missing session key → orphan DISCONNECTED" yang ada. ✅

### 4.7 Section 10 — Error Handling (review)

Tidak perlu error code baru. RE_INIT failure → DISCONNECTED sudah punya mekanisme via existing error enum (TIMEOUT, CONNECTION_LOST, UNKNOWN).

### 4.8 Section 11 — Edge Cases (HARUS diupdate)

Tambahkan edge cases:

| ID | Case | Handling |
|----|------|----------|
| EC-011 | RE_INIT triggered tapi session data di DB sudah invalid/expired | Emit RE_INIT, lalu Baileys akan fail → emit DISCONNECTED. Admin perlu INIT ulang dengan QR. |
| EC-012 | RE_INIT dan INIT terjadi berurutan dalam waktu singkat | RE_INIT gagal → DISCONNECTED → Admin trigger INIT baru dengan QR. Keduanya dicatat. |
| EC-013 | Service restart trigger banyak RE_INIT sekaligus untuk banyak akun | Setiap akun punya RE_INIT event masing-masing. Dedup window untuk RE_INIT perlu dipertimbangkan (mirip DISCONNECTED). |

### 4.9 Section 14 — Success Metrics (pertimbangan)

RE_INIT events perlu di-track untuk mengukur:
- Berapa banyak RE_INIT yang berhasil (→ CONNECTED) vs gagal (→ DISCONNECTED)
- Success rate RE_INIT = proxy untuk credential stability

Tambahkan KPI opsional: *"RE_INIT success rate: percentage of RE_INIT events that lead to CONNECTED within 60 seconds."*

### 4.10 Section 17 — Limitations (review)

Tidak ada perubahan diperlukan.

### 4.11 Section 19.1 — Appendix Connection Session Pairing Rules (HARUS diupdate)

Tambahkan row:

| Rule | Expected Behavior |
|------|------------------|
| RE_INIT does not start a session | `RE_INIT` only marks that a restore attempt has started. Session is created only on `CONNECTED`. |

### 4.12 Section 19.3 — Smoke Test Checklist (HARUS diupdate)

Tambahkan step:

| Step | Expected Result |
|------|----------------|
| Service restart with saved credentials | `RE_INIT` event appears with `actorType = system` and `metadata.trigger = auto_restore` |
| RE_INIT succeeds | `RE_INIT` followed by `CONNECTED` within expected timeframe |
| RE_INIT fails | `RE_INIT` followed by `DISCONNECTED` (orphan) |

---

## 5. Lifetime Scope — OQ-004 Resolved

User mengklarifikasi:
> "Hitung dari account channel berhasil connect hingga status nya berubah not connected (disconnect atau suspend)"

**Ini adalah per-session lifetime**, bukan total akumulasi:
- Start: `CONNECTED`
- End: `DISCONNECTED` (any reason, termasuk `AUTO_SUSPEND`)

PRD v1.2 sudah menangani ini dengan benar:
- Normal disconnect: DISCONNECTED dengan `duration_ms`
- Suspend while connected: DISCONNECTED(AUTO_SUSPEND) → SUSPENDED, `duration_ms` dari CONNECTED ke DISCONNECTED

**OQ-004 harus di-resolve di PRD:** *"Lifetime displays per-session. Start = CONNECTED, End = DISCONNECTED (any reason). Total lifetime is not required in Phase 1."*

Implikasi: FR-014 (`System SHOULD provide total lifetime by summing completed sessions`) bisa di-downgrade ke Future atau tetap SHOULD untuk opsional display.

---

## 6. State Machine Update Lengkap

Dengan RE_INIT, state machine account channel menjadi:

```
[CREATED]
    │
    ├─ INIT (QR diperlukan, no credentials) ──────────────────────┐
    │       │                                                      │
    │       ▼ SCAN                                                 │
    │       │                                                      │
    │       ▼ CONNECTED ◄──── RE_INIT (credentials ada) ──────────┤
    │              │                  │                            │
    │              │           gagal: DISCONNECTED (orphan)        │
    │              │                                               │
    │              ▼ DISCONNECTED ─────────────────────────────────┘
    │              │
    │              ├─ credentials masih ada → RE_INIT
    │              └─ credentials tidak ada / admin trigger fresh → INIT
    │
    └─ SUSPENDED (dari state mana saja)
            │
            [if was connected: DISCONNECTED(AUTO_SUSPEND) → SUSPENDED]
            [if not connected: hanya SUSPENDED]
```

**Transisi valid yang perlu ditambahkan di PRD:**

| Dari | Event | Ke | Kondisi |
|------|-------|----|---------|
| DISCONNECTED | RE_INIT | RESTORING | Credentials ada di DB |
| RESTORING | CONNECTED | CONNECTED | Baileys restore berhasil |
| RESTORING | DISCONNECTED | DISCONNECTED | Baileys restore gagal |
| DISCONNECTED | INIT | INITIALIZING | No credentials, atau user pilih fresh QR |

---

## 7. Impact Analysis Delta (karena RE_INIT)

### 7.1 Module Impact

| Module | Perubahan | Level |
|--------|-----------|-------|
| `whatsapp-service` | Detect RE_INIT condition (session data di DB tapi tidak connected), emit RE_INIT event | **HIGH** |
| `audit-service` | Terima dan simpan RE_INIT event — schema sudah bisa handle (event_type enum expand) | LOW |
| `libs/common` | Tambah `RE_INIT` ke `AccountChannelEventTypeEnum` | LOW |
| FE timeline | Render RE_INIT event di timeline dengan icon/label yang sesuai | LOW |

### 7.2 Detection Logic untuk RE_INIT (Engineering Design Question)

PRD perlu menjawab: **kapan tepatnya whatsapp-service tahu bahwa kondisi RE_INIT terpenuhi?**

Opsi yang mungkin:
- A. Saat service startup, scan semua akun yang punya credentials di DB dan status terakhir di Redis bukan CONNECTED → trigger RE_INIT untuk setiap akun
- B. Saat Baileys sendiri trigger auto-restore → intercept dan emit RE_INIT sebelum restore dimulai
- C. Saat admin klik "Connect" untuk akun yang sudah punya credentials (bukan fresh account)

**Ini adalah OQ baru yang perlu dijawab Engineering** sebelum implementasi RE_INIT.

### 7.3 Concurrency Impact RE_INIT

| Skenario | Risiko | Mitigasi |
|----------|--------|----------|
| Service restart trigger RE_INIT untuk 100 akun sekaligus | RabbitMQ spike | Fire-and-forget async, acceptable burst |
| RE_INIT concurrent dengan CONNECTED dari auto-restore yang berhasil | RE_INIT dan CONNECTED hampir bersamaan | RE_INIT harus diemit SEBELUM Baileys restore dimulai — ordering penting |
| RE_INIT duplikat (service crash dan restart → RE_INIT dua kali untuk akun yang sama) | Duplicate RE_INIT events | Idempotency key mencegah duplikat di storage |

---

## 8. Perubahan yang Dibutuhkan di PRD v1.3

### Mandatory (HARUS ada sebelum sprint)

| # | Perubahan | Section |
|---|-----------|---------|
| M-01 | Tambah `RE_INIT` ke Section 5 Event Definitions | Section 5 |
| M-02 | Tambah FR-032 untuk RE_INIT | Section 7 |
| M-03 | Tambah `RE_INIT` ke `event_type` enum | Section 9 field table |
| M-04 | Tambah idempotency key format RE_INIT | Section 9.2 |
| M-05 | Tambah session rule untuk RE_INIT (tidak buat session, hanya CONNECTED yang buat) | Section 9.1 |
| M-06 | Tambah note: RE_INIT flow tidak emit SCAN | Section 7 FR-027 atau FR-032 |
| M-07 | Tambah EC-011, EC-012, EC-013 | Section 11 |
| M-08 | Update Appendix 19.1 session pairing rules dengan RE_INIT | Section 19.1 |
| M-09 | Update Appendix 19.3 smoke test dengan RE_INIT scenarios | Section 19.3 |
| M-10 | Resolve OQ-004 — lifetime = per-session, end = DISCONNECTED | Section 18 → hapus OQ-004 atau mark resolved |

### Conditional (sesuaikan dengan jawaban OQ)

| # | Perubahan | Kondisi |
|---|-----------|---------|
| C-01 | Tambah OQ baru: bagaimana whatsapp-service detect RE_INIT condition? | Tergantung Baileys API |
| C-02 | Tambah KPI RE_INIT success rate | Jika PM setuju |
| C-03 | FR-014 (total lifetime) downgrade ke Future / SHOULD | Jika per-session saja yang diperlukan Phase 1 |

---

## 9. Open Questions Update

| OQ ID | Pertanyaan | Status |
|-------|-----------|--------|
| OQ-001 | `suspendAccountChannel` sudah ada? | ⚠️ **BLOCKER — masih open** |
| OQ-002 | Retention policy? | ⚠️ Masih open |
| OQ-003 | Baileys SCAN signal? | ⚠️ **BLOCKER — masih open** |
| OQ-004 | Lifetime per-session, total, atau keduanya? | ✅ **RESOLVED** — per-session, end = DISCONNECTED |
| **OQ-NEW-01** | Bagaimana whatsapp-service mendeteksi kondisi RE_INIT? (credential di DB tapi tidak connected) | ⚠️ **Baru — perlu jawaban Engineering sebelum sprint** |
| **OQ-NEW-02** | Apakah RE_INIT perlu dedup window seperti DISCONNECTED? (service restart → banyak RE_INIT berurutan) | ⚠️ **Baru — perlu jawaban Engineering** |

---

## 10. Recommendation

### Summary

PRD v1.2 sudah sangat solid untuk 7 dari 8 goals. **Satu goal kritis (G-08 RE_INIT) sepenuhnya tidak ada** dalam PRD. RE_INIT bukan edge case kecil — ia adalah event penting dalam siklus hidup akun WhatsApp Web karena Baileys auto-restore adalah mekanisme utama yang menjaga akun tetap connected setelah restart.

Tanpa RE_INIT:
- Admin tidak bisa melihat kapan sistem mencoba restore sesi yang tersimpan
- Tidak bisa membedakan "akun fresh connect dengan QR" vs "akun restore dari credentials"
- Timeline menjadi tidak lengkap — ada "lompatan" dari DISCONNECTED langsung ke CONNECTED tanpa jejak usaha reconnect

### Go/No-Go Assessment

| Kondisi | Status |
|---------|--------|
| G-01 s.d. G-07 covered by PRD v1.2 | ✅ |
| **G-08 RE_INIT covered** | ❌ — **PRD v1.3 diperlukan** |
| OQ-004 lifetime resolved | ✅ — per-session |
| OQ-001 SUSPENDED action confirmed | ⚠️ Masih open |
| OQ-003 Baileys SCAN signal | ⚠️ Masih open |
| OQ-NEW-01 RE_INIT detection method | ⚠️ Baru, perlu jawaban |

**Verdict: PRD perlu update ke v1.3 untuk memasukkan RE_INIT sebelum sprint planning.**

RE_INIT adalah tambahan yang relatif terisolasi — tidak mengubah arsitektur yang sudah ada, hanya menambah event type baru dengan rules yang sudah bisa diprediksi dari pola existing. Estimasi effort penambahan di PRD: low-medium. Di implementasi: medium (perlu define detection logic di whatsapp-service).
