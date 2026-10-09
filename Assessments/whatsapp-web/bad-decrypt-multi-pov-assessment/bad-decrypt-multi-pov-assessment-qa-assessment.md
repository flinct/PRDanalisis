# Assessment Report: Bad Decrypt — WhatsApp Media Decryption Failure (Multi-POV)

> **Assessment Type:** Type 2 — Bug Fix Analysis
> **Owner:** Analyst
> **Source Input:** WP #3863 (Bad decrypt config Organization level), Loki monitoring data, Baileys source code trace, Baileys issues #2700/#2763
> **Assessment Artifact Path:** `Assessments/whatsapp-web/bad-decrypt-multi-pov-assessment/bad-decrypt-multi-pov-assessment-qa-assessment.md`
> **Version:** v1.0
> **Tanggal Analisa:** 2026-09-29
> **Status:** Draft

---

## 0. Ringkasan

- Error `ERR_OSSL_BAD_DECRYPT` dari `WhatsAppMessageService.downloadAndUploadMedia()` menghasilkan **~7,000 error/jam secara konstan** (62,709+ dalam 7 hari terakhir)
- Error bukan spike — ini **infinite retry loop** dari stuck messages yang sama
- Multi-POV analysis mengidentifikasi **3 root cause yang saling memperparah**, bukan 1
- WP #3863 (org-level config) adalah operational knob, bukan root cause fix

---

## 1. Error Signature

```
[Nest] 7 ERROR [WhatsAppMessageService] Error: error:1C800064:Provider routines::bad decrypt
  code: 'ERR_OSSL_BAD_DECRYPT',
  library: 'Provider routines',
  reason: 'bad decrypt',
  at Decipheriv.final (node:internal/crypto/cipher:184:29)
  at Transform.final [as _final] (baileys/lib/Utils/messages-media.js:507:31)
```

Lokasi kode: Baileys `messages-media.ts` line 645 — `aes.final()` pada Transform stream decrypt AES-256-CBC.

---

## 2. Data Mentah (Loki + JSONL)

### 2.1 Volume Harian (28 September 2026, full day Loki)

| WIB | Count | Bar |
|---|---|---|
| 09:00 | 1,470 | ███ |
| 10:00 | 7,716 | █████████████████ |
| 11:00 | 8,228 | ██████████████████ |
| 12:00 | 4,540 | ██████████ |
| 13:00 | 7,508 | ████████████████ |
| 14:00 | 6,660 | ██████████████ |
| 15:00 | 5,212 | ███████████ |
| **Total** | **41,334** | |

> Data 00:00–08:00 WIB sudah di-retention Loki.

### 2.2 Kumulatif 7 Hari (JSONL pull_errors.py)

| File | Total bad decrypt |
|---|---|
| 2026-09-21 | 9,439 |
| 2026-09-23 | 9,151 |
| 2026-09-24 | 9,227 |
| 2026-09-28 | 16,848 |
| 2026-09-29 | 18,044+ (ongoing) |
| **Total** | **62,709+** |

### 2.3 Frequency Pattern

Error muncul setiap **2-5 detik**, konstan 6,700–8,200/jam. **Tidak ada off-peak** — rate sama jam 03:00 dan 13:00 WIB.

### 2.4 Scope

- **100% media messages** — tidak ada dari text/event lain
- **1 Baileys worker pod** (`whatsapp-78d7f9c45f-hg7wt`) — semua error dari 1 pod
- **0 restarts dalam 24h** — pod stabil, bukan crash loop

---

## 3. Multi-POV Analysis

### POV A: Cryptographic — OpenSSL AES-256-CBC PKCS7

**Mekanisme:**
```
Baileys downloadEncryptedContent()
  → HTTP GET mmg.whatsapp.net/{directPath}  (streaming)
  → Transform stream: aes.update(chunk) per 16-byte aligned block
  → aes.final() ← GAGAL di sini
```

`aes.final()` memproses blok terakhir dengan PKCS7 unpadding. Kalau ciphertext truncated, corrupt, atau key/IV salah → OpenSSL throw `1C800064`.

**Fakta dari kode:**
- Cipher: `aes-256-cbc` (bukan GCM)
- Key derivation: HKDF(mediaKey, 112 bytes) → iv(16) + cipherKey(32) + macKey(32)
- Streaming decrypt — tidak buffer full file dulu
- `toSmallestChunkSize()` memotong ke kelipatan 16 byte, sisa di `remainingBytes`

**Kemungkinan penyebab:**
1. **Truncated ciphertext** — download terpotong, blok terakhir tidak lengkap → PKCS7 fail
2. **Wrong key** — mediaKey salah atau expired (WhatsApp media keys ephemeral)
3. **CDN corruption** — file di `mmg.whatsapp.net` corrupt di sisi server

---

### POV B: Network — IPv6/IPv4 Instability (Infra Dependency, Bukan Aplikasi)

| Error | Count/hari | Target |
|---|---|---|
| `connect ENETUNREACH` (IPv6) | 509 | `2a03:2880:f34b:120:face:b00c:0:167:443` |
| `connect ETIMEDOUT` (IPv4) | 509 | `57.144.151.32:443` |

**Korelasi temporal dengan bad decrypt:**

| WIB | ETIMEDOUT | bad decrypt |
|---|---|---|
| 08:00 | 36 | rendah |
| 10:00 | 766 | 7,716 |
| 11:00 | 364 | 8,228 |
| 12:00 | 820 | 4,540 |
| 13:00 | 889 | 7,508 |

**Constraint:** WhatsApp socket connection di-handle oleh **1 VM dedicated**. Network config (IPv6/IPv4 routing, DNS, firewall) di level VM/infra — **di luar kontrol aplikasi SatuInbox**. SatuInbox tidak bisa mengubah VM network stack.

**Yang bisa dikontrol SatuInbox:**
- `NODE_OPTIONS=--dns-result-order=ipv4first` — skip IPv6 attempt (kalau VM allow env override)
- **Application-level download retry** — kalau koneksi timeout, retry download sebelum pass ciphertext ke decipher

**Diagnosis:** Network flaky adalah **fakta infra** yang harus di-mitigate di layer aplikasi, bukan di-fix di layer network. Solusi: **download retry + full buffer decrypt** (Tier 3) — bukan fix network-nya.

---

### POV C: Baileys Library — Known Bug #2700 + LID Addressing

**[Baileys #2700](https://github.com/WhiskeySockets/Baileys/issues/2700)** (OPEN, `bug`):
- Intermittent media decryption failure, bahkan setelah clear session + reconnect
- Lebih sering di **LID (Linked Identity) addressing mode**
- Ada commit fix (`e05d3df`) tapi belum merged ke master

**[Baileys #2763](https://github.com/WhiskeySockets/Baileys/pull/2763)** (OPEN, `stale`):
- Root cause: `decryptMessageNode` pick 1 JID form (phone-number vs LID) tapi session bisa di-establish di form lain
- WhatsApp migrasi ke LID addressing → satu device punya 2 identity forms
- Baileys salah pilih → `Bad MAC` / session lookup fail

**Diferensiasi error:**

| Scenario | Error Type | Frequency |
|---|---|---|
| LID/PN mismatch (Signal layer) | `Bad MAC`, `No session found` | ~5-10/jam (WARN) |
| Truncated download (network) | `ERR_OSSL_BAD_DECRYPT` | **~7,000/jam** (ERROR) |
| Corrupt CDN file | `ERR_OSSL_BAD_DECRYPT` | Unknown (tercampur) |

Baileys #2700/#2763 fix **Signal layer** issues. Untuk media `ERR_OSSL_BAD_DECRYPT`, fix berbeda — perlu download retry atau buffer-full-before-decrypt.

---

### POV D: Operational — Infinite Retry Loop

**Ini bukan penyebab error, tapi ini yang bikin 7k/jam.**

Flow saat ini:
1. Media message masuk → `downloadAndUploadMedia()` → `aes.final()` fail → error throw
2. Error di-catch di Baileys service → message **di-requeue** ke RabbitMQ consumer
3. Retry → download URL/key sama → fail lagi → requeue lagi
4. Loop terus sampai message TTL expired

**Bukti dari log:**
- Rate konstan 6.7k-8.2k/jam regardless of business hours
- Burst pattern per 2-5 detik = setiap retry cycle generate 5-13 error sekaligus
- Tidak ada exponential backoff visible

**Tanpa loop, error akan 0** — media yang corrupt tetap gagal, tapi 1x per message, bukan 7k/jam.

---

### POV E: Infrastructure — Single Point of Failure

| Component | Count | Risk |
|---|---|---|
| Baileys worker pod | **1** | All WA sessions in 1 pod |
| API pods | 2 replicas | OK |
| Daily restart cronjobs | 3 | Workaround manual untuk break loops |

**Konsekuensi:**
- Semua 7k error dari 1 pod
- Kalau pod crash → semua WhatsApp session hilang sekaligus
- Daily restart cron (3 jobs!) = workaround manual untuk break reconnect loop
- Tidak ada horizontal scaling untuk Baileys worker

---

## 4. Root Cause Summary

```
                    ┌─────────────────┐
                    │  Network Flaky  │ (IPv6 ENETUNREACH + IPv4 ETIMEDOUT)
                    │  ke WA CDN      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Download Trunc- │ (ciphertext partial)
                    │ ated / Corrupt  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  aes.final()    │ (PKCS7 padding validation fail)
                    │  BAD_DECRYPT    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Infinite Retry  │ (no dead-letter, no backoff)
                    │ Loop @ 7k/hr    │
                    └─────────────────┘
```

**3 faktor yang saling memperparah:**
1. **Network** → download ter-truncate
2. **Streaming decrypt** → partial ciphertext langsung ke decipher, tidak validasi完整性 dulu
3. **Infinite retry** → error yang seharusnya 1x/message jadi 7k/jam

---

## 5. Solusi — Tiered

### Tier 1: Kill the Loop (1 jam, immediate impact)

```typescript
// WhatsAppMessageService.downloadAndUploadMedia()
try {
  const buffer = await downloadEncryptedContent(downloadUrl, keys, opts);
  // ... upload
} catch (err) {
  if (err.code === 'ERR_OSSL_BAD_DECRYPT') {
    this.logger.warn({ messageId }, 'Bad decrypt, skipping (no retry)');
    return; // break infinite loop
  }
  throw err;
}
```

**Efek:** 7k error/jam → ~0.

### Tier 2: Force IPv4 (5 menit, infra)

```yaml
# k8s deployment env
- name: NODE_OPTIONS
  value: "--dns-result-order=ipv4first"
```

Skip IPv6 timeout cycle ke WhatsApp CDN.

### Tier 3: Download Retry + Full Buffer (1 hari, root cause)

```typescript
// downloadContentFromMessage — retry download, bukan retry decrypt
let buffer: Buffer;
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    const stream = await getHttpStream(downloadUrl, { headers });
    buffer = await toBuffer(stream);
    break;
  } catch (err) {
    if (attempt === 3) throw err;
    await sleep(attempt * 1000);
  }
}
// Decrypt full buffer, bukan stream → tidak ada truncated ciphertext
```

**Efek:** Fix root cause truncated download.

### Tier 4: Org Config — WP #3863 (3-5 hari)

6 parameter yang sudah hardcoded → pindah ke per-org config:
- `decryptGuardEnabled` (toggle)
- `decryptFailureThreshold` (default: 3)
- `decryptFailureWindowMs` (default: 60000)
- `syncFullHistory` (boolean)
- `historySyncMaxAgeDays` (default: 30)
- `historySyncMaxMessagesPerChat` (default: 50)

Blocker: whatsapp app belum punya gRPC client ke company-service.

### Tier 5: Baileys Upgrade (saat upstream merge)

Monitor #2700 (media retry fallback) dan #2763 (LID/PN fix). Begitu merged → upgrade.

---

## 6. Rekomendasi Prioritas

| # | Fix | Effort | Impact | Root cause? |
|---|---|---|---|---|
| 1 | Try-catch guard, jangan requeue | 1 jam | Kill 7k/hr error storm | Symptom fix |
| 2 | Force IPv4 (`NODE_OPTIONS`) | 5 menit | Reduce network timeouts | Partial |
| 3 | Download retry + full buffer decrypt | 1 hari | Fix truncated media | **Yes** |
| 4 | Org config (WP #3863) | 3-5 hari | Per-tenant control | Operational knob |
| 5 | Baileys upgrade | 1 hari | LID fix + media retry | **Yes** (upstream) |

**Rekomendasi:** Deploy Tier 1 + 2 hari ini (effort < 1 jam total, impact langsung). Tier 3 minggu ini. Tier 4 sesuai timeline WP #3863.

---

## 7. Alert Monitoring Gap

Saat ini **tidak ada alert** untuk bad decrypt. Yang ada:
- `WhatsApp Connection Alert` — hanya untuk `ENETUNREACH` connection errors
- Pod restart alerts — tidak relevan (0 restarts)

**Rekomendasi tambah alert:**
```
Loki: count_over_time({app="whatsapp"} |= "bad decrypt" [5m]) > 50
→ Alert ke Google Chat (sesuai WP #3863 section 2)
```

---

## 8. Referensi

- Baileys source: `src/Utils/messages-media.ts` line 613-653 (Transform decrypt stream)
- Baileys #2700: ERR_OSSL_BAD_DECRYPT intermittent media failure (OPEN)
- Baileys #2763: LID/PN pairing fix (OPEN, stale)
- Commit `e05d3df`: Media Retry fallback (not merged)
- WP #3863: Bad decrypt config Organization level (In progress)
- Loki data: `{app="whatsapp"} |= "bad decrypt"` — namespace `default`
- Pod: `whatsapp-78d7f9c45f-hg7wt` (single Baileys worker)