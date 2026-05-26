# Impact Analysis — Update Baileys untuk Support International Number

## 1. Impact Statement

### Critical Impact (bisa break app)

| Area | File | Dampak |
|---|---|---|
| `parsePhoneNumber()` | `utils/baileys.util.ts:144-162` | **Hardcoded +62**. Semua nomor non-62 akan otomatis dipaksa jadi format `62...`. Non-Indonesia numbers akan **salah diformat** — pesan gagal terkirim, contact lookup broken |
| `getWhatsAppId()` | `utils/baileys.util.ts:175-181` | JID construction bergantung `parsePhoneNumber()`. Jika nomor asing masuk, JID yang dihasilkan salah → `sendMessage` error |
| `getPhoneNumber()` | `services/baileys.service.ts:1295` & `services/whatsapp-message.service.ts:654` | Hanya extract leading digits — **tidak normalize country code**. Dipakai untuk lookup contact, store ke DB, match dengan account. Data jadi inkonsisten |
| `validatePhoneNumber()` | `services/baileys.service.ts:418-435` | String comparison tanpa canonical normalization. Nomor `+1 (555) 123-4567` dan `15551234567` akan dianggap berbeda → **connection validation bisa gagal** |
| Connection/auth | `services/whatsapp-connection.service.ts` | Auth state MongoDB keyed by phone. Jika phone format berubah, session lookup bisa miss |

### High Impact

| Area | File | Dampak |
|---|---|---|
| Lookup keys | `services/baileys.dependencies.ts` (`getAccountChannelByPhone`, `upsertClientContact`) | Contact & channel di-cache/di-lookup via phone number. Format mismatch → data duplication atau miss |
| Broadcast | `services/whatsapp-message.service.ts` (`validateAndPrepareReceiver`) | Recipient validation dengan format yang salah → broadcast gagal ke nomor internasional |
| Cross-service | People service, Channel service, Conversation service | Nomor disimpan dengan asumsi +62. Format berubah → contact link broken, SLA metric mismatch |
| FE | Input validation, masking | Display formatting, phone input mask hardcoded untuk Indonesia |

### Low Impact (tapi perlu adjustment)

| Area | Dampak |
|---|---|
| `@IsValidPhoneNumber()` decorator | E.164 regex sudah cukup fleksibel, tapi perlu verifikasi tidak ada asumsi `62` prefix |
| LID mapping (`resolveJid()`) | Tidak terkait country code, jadi relatif aman |
| PRD docs | Need update spesifikasi format nomor |

### Rekomendasi Mitigasi

1. **Ganti `parsePhoneNumber()` dengan `libphonenumber-js`** — library resmi Google untuk parsing/format nomor internasional
2. **Implementasikan canonical E.164 normalization** di satu tempat (utility function) — semua service panggil fungsi yang sama
3. **Update `validatePhoneNumber()`** — normalize E.164 sebelum compare
4. **Audit semua penyimpanan phone number** — pastikan format konsisten (E.164 tanpa `+` untuk internal, atau E.164 dengan `+` untuk API)

---

## 2. Core BE Components yang Wajib di-Test

### Priority 1 — Langsung terkait number handling

| Component | File | Alasan |
|---|---|---|
| `parsePhoneNumber()` | `utils/baileys.util.ts` | **Fungsi utama normalisasi nomor**. Harus support semua country code |
| `getWhatsAppId()` | `utils/baileys.util.ts` | **JID construction** — gateway ke Baileys. Semua send/receive melewati sini |
| `getPhoneNumber()` | `services/baileys.service.ts` & `services/whatsapp-message.service.ts` | **Extract nomor dari JID** — dipakai untuk lookup, store, match |
| `validatePhoneNumber()` | `services/baileys.service.ts` | **Connection validation** — memastikan QR-scanned account sesuai |
| `resolveJid()` | `services/baileys.service.ts` | **LID → phone number mapping** (makin penting untuk international) |

### Priority 2 — Flow integration

| Component | File | Alasan |
|---|---|---|
| `validateAndPrepareReceiver()` | `services/whatsapp-message.service.ts` | **Persiapan receiver sebelum send message** |
| `sendMessage()` | `services/whatsapp-message.service.ts` | **End-to-end message delivery** |
| `upsertClientContact()` | `services/baileys.dependencies.ts` | **Contact creation/update** — phone format disini |
| `getAccountChannelByPhone()` | `services/baileys.dependencies.ts` | **Account lookup by phone** |
| Connection lifecycle (`initConnection`) | `services/whatsapp-connection.service.ts` | **Socket initialization dengan auth state** |

### Priority 3 — Edge cases

| Component | File | Alasan |
|---|---|---|
| Group handling (JID `@g.us`) | `utils/baileys.util.ts` + `baileys.service.ts` | Group bisa contain international members |
| Broadcast message | `services/whatsapp-message.service.ts` | Broadcast ke banyak nomor sekaligus |
| Event handlers (messages.upsert, etc.) | `services/baileys.service.ts` | Inbound message processing dengan various phone formats |

### Priority 4 — Cross-service contract

| Component | File | Alasan |
|---|---|---|
| Protobuf type definitions | `libs/proto-types/.../whatsapp.ts` | gRPC contract untuk phone fields |
| Client contact service | People service `client-contact.service.ts` | Contact lookup & store |
| Channel service | Channel service `account-channel.service.ts` | Account lookup |
| Phone validation decorator | `libs/common/.../phone-number.validation.ts` | Input validation API Gateway |

---

## 3. Detailed Test List

### A. Unit Tests — `baileys.util.ts` (`parsePhoneNumber`)

```
Test Case: parsePhoneNumber - Indonesia formats
  Input: "+628123456789"     -> Output: "628123456789"
  Input: "08123456789"       -> Output: "628123456789"
  Input: "628123456789"      -> Output: "628123456789"
  Input: "+6281234567890"    -> Output: "6281234567890"  (11 digit setelah 62)

Test Case: parsePhoneNumber - US/Canada (+1)
  Input: "+14155552671"      -> Output: "14155552671"
  Input: "14155552671"       -> Output: "14155552671"
  Input: "+1 (415) 555-2671" -> Output: "14155552671"
  Input: "1-415-555-2671"    -> Output: "14155552671"

Test Case: parsePhoneNumber - UK (+44)
  Input: "+442071234567"     -> Output: "442071234567"
  Input: "02071234567"       -> Output: "442071234567"  (local -> national)
  Input: "+44 20 7123 4567"  -> Output: "442071234567"

Test Case: parsePhoneNumber - India (+91)
  Input: "+919876543210"     -> Output: "919876543210"
  Input: "09876543210"       -> Output: "919876543210"

Test Case: parsePhoneNumber - Other countries
  Input: "+861012345678"     -> Output: "861012345678"  (China, 12 digits)
  Input: "+5511912345678"    -> Output: "5511912345678" (Brazil, 13 digits)
  Input: "+61212345678"      -> Output: "61212345678"   (Australia)

Test Case: parsePhoneNumber - Edge cases
  Input: ""                  -> throw Error (kosong)
  Input: "abc"               -> throw Error (non-digit)
  Input: "+12345"            -> throw Error (terlalu pendek, < 8 digit)
```

### B. Unit Tests — `baileys.util.ts` (`getWhatsAppId`)

```
Test Case: getWhatsAppId - Standard JID
  Input: "628123456789"     -> Output: "628123456789@s.whatsapp.net"
  Input: "14155552671"      -> Output: "14155552671@s.whatsapp.net"
  Input: "442071234567"     -> Output: "442071234567@s.whatsapp.net"

Test Case: getWhatsAppId - Already a JID
  Input: "62812@g.us"            -> Output: "62812@g.us"
  Input: "123@s.whatsapp.net"    -> Output: "123@s.whatsapp.net"

Test Case: getWhatsAppId - Group JID (length > 15 digits)
  Input: "6281234567890123456"   -> Output: "6281234567890123456@g.us"
  Input: "1415555267112345678"   -> Output: "1415555267112345678@g.us"
```

### C. Unit Tests — `baileys.service.ts` / `whatsapp-message.service.ts` (`getPhoneNumber`)

```
Test Case: getPhoneNumber - Extract from JID
  Input: "628123456789@s.whatsapp.net"  -> Output: "628123456789"
  Input: "14155552671@s.whatsapp.net"   -> Output: "14155552671"
  Input: "442071234567@s.whatsapp.net"  -> Output: "442071234567"
  Input: "12345@g.us"                   -> Output: "12345"
  Input: "invalid"                      -> Output: "" (empty)

Test Case: getPhoneNumber - With LID
  Input: "1294934029:132@lid"           -> Output: "1294934029"
```

### D. Unit Tests — `baileys.service.ts` (`validatePhoneNumber`)

```
Test Case: validatePhoneNumber - Match
  Expected: "628123456789",   Actual: "628123456789"     -> true
  Expected: "+628123456789",  Actual: "628123456789"     -> true
  Expected: "628123456789",   Actual: "+628123456789"    -> true
  Expected: "14155552671",    Actual: "+14155552671"     -> true

Test Case: validatePhoneNumber - Mismatch
  Expected: "628123456789",   Actual: "628987654321"     -> false
  Expected: "14155552671",    Actual: "14155552672"      -> false

Test Case: validatePhoneNumber - International
  Expected: "442071234567",   Actual: "+442071234567"    -> true
  Expected: "442071234567",   Actual: "442071234560"     -> false
```

### E. Integration Tests — Message Send Flow

```
Test Case: Send message to Indonesia number
  - Siapkan instance WhatsApp terautentikasi
  - Panggil sendMessage({ to: "628123456789", text: "Hello" })
  - Verify: message terkirim ke JID "628123456789@s.whatsapp.net"
  - Verify: status response success

Test Case: Send message to US number
  - Panggil sendMessage({ to: "14155552671", text: "Hello" })
  - Verify: JID = "14155552671@s.whatsapp.net"
  - Verify: message terkirim sukses

Test Case: Send message to UK number
  - Panggil sendMessage({ to: "442071234567", text: "Hello" })
  - Verify: JID = "442071234567@s.whatsapp.net"
  - Verify: message terkirim sukses

Test Case: Send message using referenceId (full JID) - International
  - referenceId = "14155552671@s.whatsapp.net"
  - Verify: tidak di-parse ulang, langsung digunakan
  - Verify: message terkirim sukses
```

### F. Integration Tests — Connection & Auth

```
Test Case: Scan QR dengan nomor non-Indonesia
  - Init instance untuk nomor US (+14155552671)
  - Scan QR
  - Verify: validatePhoneNumber match
  - Verify: auth state tersimpan dengan format E.164 (14155552671)
  - Verify: connection stable (tidak disconnect loop)

Test Case: Scan QR dengan nomor Indonesia (regression)
  - Pastikan flow existing tidak broken

Test Case: Reconnect international account
  - Restart service
  - Verify: auth state diload dengan benar
  - Verify: connection restored
```

### G. Integration Tests — Contact Lookup & Store

```
Test Case: Inbound message from international number
  - Receive message dari "14155552671@s.whatsapp.net"
  - Verify: resolveJid() -> "14155552671"
  - Verify: upsertClientContact dengan phone "14155552671"
  - Verify: getAccountChannelByPhone dengan "14155552671"
  - Verify: conversation routing correct

Test Case: Inbound message from Indonesia number (regression)
  - Receive message dari "628123456789@s.whatsapp.net"
  - Verify: flow normal tetap bekerja

Test Case: Contact dengan multiple country codes
  - Indonesia: "628123456789"
  - US: "14155552671"
  - UK: "442071234567"
  - Verify: masing-masing bisa create contact, send message, receive message
```

### H. Integration Tests — Broadcast

```
Test Case: Broadcast ke mixed country codes
  - Recipient list: ["628123456789", "14155552671", "442071234567"]
  - Panggil sendBroadcastMessage
  - Verify: semua recipient mendapatkan pesan
  - Verify: masing-masing dengan JID yang benar

Test Case: Broadcast validation dengan international numbers
  - Input valid: "+14155552671", "628123456789"
  - Input invalid: "abcd", "123"
  - Verify: valid diteruskan, invalid ditolak
```

### I. Edge Case & Negative Tests

```
Test Case: Phone number dengan leading zeros (non-Indonesia)
  - Local India: "09876543210"  -> normalize: "919876543210"
  - Local UK: "02071234567"    -> normalize: "442071234567"
  - Pastikan tidak di-prepend dengan "62"

Test Case: Phone number dengan special characters
  - "+1 (415) 555-2671 ext.123" -> cukup ambil digit: "14155552671"
  - "+44-20-7123-4567"          -> "442071234567"

Test Case: Empty/null phone number
  - to: ""          -> throw error
  - to: null        -> throw error
  - to: undefined   -> throw error

Test Case: Invalid JID format
  - remoteJid: "not-a-jid"        -> getPhoneNumber harus return ""
  - remoteJid: "12345"@invalid    -> harus dihandle dengan baik

Test Case: LID untuk international user
  - LID JID masuk, resolveJid harus mampu map ke phone number
  - Jika user ada di country code non-62
```

### J. Cross-Service Contract Tests (gRPC)

```
Test Case: AccountInfo protobuf - phoneNumber field
  - Create account dgn nomor US
  - GetInstance -> AccountInfo.phoneNumber = "14155552671" (E.164 tanpa +)
  - FE harus menampilkan dengan format yang benar

Test Case: SendMessageRequest - to field
  - to: "14155552671"   -> service terima & proses
  - to: "+14155552671"  -> apakah perlu accept? (decide format standard)
  - to: "628123456789"  -> tetap bekerja (regression)
```

### K. Performance & Stability Tests

```
Test Case: Stress test - multiple international accounts
  - 10 accounts: mix Indonesia, US, UK, India, Brazil
  - Semua connect simultan
  - Verify: tidak ada memory leak, CPU spike
  - Verify: semua stabil dalam 1 jam

Test Case: Reconnect semua accounts setelah network interrupt
  - Putus koneksi internet 30 detik
  - Setelah reconnect:
    - Semua account reconnecting
    - Tidak ada partial state corruption
    - Phone format tetap konsisten
```

### L. Regression Tests (existing +62 flow tetap bekerja)

```
Test Case: Semua test case existing untuk nomor Indonesia
  - Register akun Indonesia (+62)
  - Send/receive pesan
  - Contact lookup
  - Broadcast
  - Group messaging
  - QR scan
  - Pairing code

Test Case: Anti-spam system
  - Pastikan international number juga ikut warming, rotation, pooling
  - Pastikan broadcast humanization tidak broken
```

---

## 4. Summary

| Item | Detail |
|---|---|
| **Root Cause** | `parsePhoneNumber()` di `baileys.util.ts:144` hardcoded +62 |
| **Main File to Change** | `apps/whatsapp/src/app/utils/baileys.util.ts` |
| **Recommended Library** | `libphonenumber-js` (Google i18n phone library) |
| **Total Test Cases** | ~50+ test cases across unit, integration, edge case, regression |
| **Existing Test Coverage** | Hampir 0% untuk WhatsApp Web service — **perlu build dari awal** |
| **Risk Level** | **HIGH** — menyentuh core number handling yang mempengaruhi semua service |
| **Mitigasi Wajib** | 1) canonical E.164 utility function, 2) libphonenumber-js, 3) audit semua penyimpanan phone number, 4) comprehensive test suite |
