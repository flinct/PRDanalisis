# Impact Analysis — Update Baileys untuk Support International Number

## 1. Overview

| Item                 | Detail                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Feature**          | Update Baileys phone number normalization to support international numbers (beyond Indonesia +62)                      |
| **Objective**        | Remove hardcoded +62 assumption in `parsePhoneNumber()` so WhatsApp Web service can handle non-Indonesia phone numbers |
| **Scope**            | WhatsApp Web service (`apps/whatsapp/`), shared phone validation decorator, cross-service gRPC contract                |
| **Business Context** | Satuinbox perlu support customer dari berbagai negara, tidak terbatas Indonesia                                        |
| **Source**           | `apps/whatsapp/src/app/utils/baileys.util.ts` — `parsePhoneNumber()` line 144-162                                      |

---

## 2. Requirement Summary

### Business Rules

| ID    | Rule                                                                                             | Source            |
| ----- | ------------------------------------------------------------------------------------------------ | ----------------- |
| BR-01 | Phone number harus di-normalize ke format E.164 tanpa `+` untuk internal storage                 | Existing behavior |
| BR-02 | Nomor Indonesia (+62) harus tetap berfungsi seperti sekarang                                     | Regression        |
| BR-03 | Nomor non-62 (US, UK, India, dll) harus bisa diproses tanpa forced 62 prefix                     | New requirement   |
| BR-04 | Phone validation saat QR scan harus menggunakan canonical normalization, bukan string comparison | Fix existing      |
| BR-05 | Format nomor harus konsisten di semua service (WhatsApp, People, Channel, Conversation)          | Data consistency  |
| BR-06 | JID construction (`getWhatsAppId`) harus menghasilkan JID yang valid untuk semua country code    | Core requirement  |

### Acceptance Criteria

| AC    | Description                                                                          |
| ----- | ------------------------------------------------------------------------------------ |
| AC-01 | `parsePhoneNumber('+14155552671')` returns `'14155552671'` not forced to `62` prefix |
| AC-02 | `parsePhoneNumber('08123456789')` still returns `'628123456789'`                     |
| AC-03 | `sendMessage({to: '14155552671'})` successfully sends to US number                   |
| AC-04 | QR scan with non-Indonesia number validates correctly                                |
| AC-05 | Contact lookup by phone works for all country codes                                  |
| AC-06 | Broadcast to mixed country codes works                                               |
| AC-07 | Existing Indonesia accounts continue to work without regression                      |

### Assumptions

| Assumption                                                 | Notes                                               |
| ---------------------------------------------------------- | --------------------------------------------------- |
| Format internal tetap E.164 tanpa `+`                      | `62812...`, `1415...`, `4420...`                    |
| `libphonenumber-js` akan digunakan sebagai library parsing | Google i18n phone library                           |
| Tidak ada perubahan protobuf field (hanya nilai/format)    | Field `phoneNumber`, `to`, `referenceId` tetap sama |

### Open Clarifications

| Question                                                                               | Impact if not clarified      |
| -------------------------------------------------------------------------------------- | ---------------------------- |
| Apakah format `+14155552671` (dengan `+`) harus di-accept di `sendMessage` `to` field? | Validasi input di controller |
| Bagaimana handling nomor dengan leading `+` di `@IsValidPhoneNumber()` decorator?      | API Gateway validation       |
| Apakah perlu update existing data di DB?                                               | Data migration scope         |

---

## 3. Flow Analysis

### As-Is (Current)

```
Input Phone → parsePhoneNumber()
                ↓
          Hardcoded check:
          - "0..." → "62..."
          - "+62..." → "62..."
          - else → prepend "62"
                ↓
          "62xxxxxxxxxx"
                ↓
          getWhatsAppId() → "62xxx@s.whatsapp.net"
                ↓
          Baileys sendMessage / lookup
```

**Problem:** Input "+14155552671" → forced "6214155552671" → invalid JID → sendMessage gagal.

### To-Be (Proposed)

```
Input Phone → parsePhoneNumber() → libphonenumber-js
                ↓
          Deteksi country code otomatis
          - "0..." → national format → E.164
          - "+..." → E.164 parse → national significant number
          - "62..." → Indonesia → "62xxx" (seperti sekarang)
                ↓
          "14155552671" / "628123456789"
                ↓
          getWhatsAppId() → "14155552671@s.whatsapp.net"
                ↓
          Baileys sendMessage / lookup
```

---

## 4. Impact Analysis

### 4.1 Directly Affected Modules

| Module                  | File                                                                                         | Impact                                                                                                  | Level  |
| ----------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| `parsePhoneNumber()`    | `apps/whatsapp/src/app/utils/baileys.util.ts:144-162`                                        | **HIGH** — Core logic rewrite. Hapus hardcoded +62, ganti dengan libphonenumber-js                      | HIGH   |
| `getWhatsAppId()`       | `apps/whatsapp/src/app/utils/baileys.util.ts:175-181`                                        | **HIGH** — Output bergantung `parsePhoneNumber()`. Jika input non-62, JID harus benar                   | HIGH   |
| `getPhoneNumber()`      | `apps/whatsapp/src/app/services/baileys.service.ts:1295` & `whatsapp-message.service.ts:654` | **MEDIUM** — Extract digits dari JID. Tidak perlu diubah, tapi perlu verifikasi output untuk non-62 JID | MEDIUM |
| `validatePhoneNumber()` | `apps/whatsapp/src/app/services/baileys.service.ts:418-435`                                  | **HIGH** — String comparison tanpa normalization. Harus diubah pakai canonical E.164 compare            | HIGH   |

### 4.2 Indirectly Affected Modules

| Module                         | File                             | How Affected                                              | Level  |
| ------------------------------ | -------------------------------- | --------------------------------------------------------- | ------ |
| `validateAndPrepareReceiver()` | `whatsapp-message.service.ts`    | Panggil `getWhatsAppId()` → kena impact dari format phone | MEDIUM |
| `upsertClientContact()`        | `baileys.dependencies.ts`        | Store phone number — format baru harus konsisten          | MEDIUM |
| `getAccountChannelByPhone()`   | `baileys.dependencies.ts`        | Lookup by phone — format mismatch cause miss              | MEDIUM |
| `sendMessage()`                | `whatsapp-message.service.ts`    | End-to-end — receiver JID harus benar                     | HIGH   |
| `initConnection()`             | `whatsapp-connection.service.ts` | Auth state keyed by phone                                 | MEDIUM |
| `resolveJid()`                 | `baileys.service.ts`             | LID mapping — perlu verifikasi non-62                     | LOW    |

### 4.3 Database Impact

| Area                      | Impact                                                                                      | Level  |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------ |
| **Existing data**         | Nomor non-62 mungkin sudah tersimpan dengan forced 62 prefix (salah). Perlu audit + cleanup | MEDIUM |
| **Session history**       | `whatsapp-session-history` schema — phone field format konsisten?                           | MEDIUM |
| **Contact phone field**   | `people-service` contact `phone` — jika ada data non-62 yang corrupted                      | MEDIUM |
| **Account channel phone** | `account-channel` `phoneNumber` — lookup key perlu konsisten                                | MEDIUM |

**Mitigation:**

- Audit existing DB untuk data non-62 yang corrupted
- Tidak perlu migration massal jika belum ada user non-62 (validated assumption)
- Implementasikan canonical format sejak deploy, data baru otomatis benar

### 4.4 API Contract Impact

| Endpoint                                     | Impact                                                     | Level  |
| -------------------------------------------- | ---------------------------------------------------------- | ------ |
| `InitInstance` — `phone_e164` field          | E.164 tanpa `+` tetap, non-62 accepted                     | LOW    |
| `SendMessage` / `SendBroadcast` — `to` field | Non-62 number accepted                                     | LOW    |
| `GetInstance` — `phoneNumber` response       | Format konsisten E.164 tanpa `+`                           | LOW    |
| `@IsValidPhoneNumber()` decorator            | Update regex atau gunakan libphonenumber-js untuk validasi | MEDIUM |

**Impact:** LOW — tidak ada breaking change. Field dan tipe tetap sama, hanya nilai yang berubah.

### 4.5 Frontend Impact

| Area                      | Impact                                           | Level  |
| ------------------------- | ------------------------------------------------ | ------ |
| Phone input mask          | Jika hardcoded +62 prefix, perlu dibuat dinamis  | MEDIUM |
| Phone display formatting  | Nomor non-62 perlu di-format sesuai country code | LOW    |
| Validation error messages | Mungkin perlu update pesan error                 | LOW    |

**Note:** Frontend impact analysis perlu dilakukan terpisah dengan akses ke FE repo.

### 4.6 Automation Testing Impact

| Area                                            | Impact                                                                                                    | Level |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----- |
| **Existing tests:** `app.controller.spec.ts`    | 3 tests — broadcast message, session errors, null send. Hanya test controller, tidak kena impact langsung | LOW   |
| **Existing tests:** `whatsapp-e2e`              | E2E health check — tidak kena impact                                                                      | LOW   |
| **New tests needed:** `baileys.util.spec.ts`    | ~15 unit tests untuk parsePhoneNumber, getWhatsAppId                                                      | HIGH  |
| **New tests needed:** `baileys.service.spec.ts` | ~10 unit/integration tests untuk validatePhoneNumber, getPhoneNumber                                      | HIGH  |
| **New tests needed:** Integration tests         | ~15 integration tests untuk sendMessage broadcast, connection                                             | HIGH  |

**Impact:** HIGH — perlu create test suite dari awal (existing coverage ~0%)

### 4.7 Security / RBAC Impact

| Area                    | Impact                                                                 | Level |
| ----------------------- | ---------------------------------------------------------------------- | ----- |
| Phone number validation | Validasi input harus robust untuk mencegah injection via special chars | LOW   |
| RBAC                    | Tidak ada perubahan — RBAC tetap sama                                  | NONE  |
| Data exposure           | Phone number exposure risk tidak berubah                               | NONE  |

### 4.8 Performance Risks

| Area                                 | Risk                                                        | Level |
| ------------------------------------ | ----------------------------------------------------------- | ----- |
| `libphonenumber-js` parsing          | Overhead parsing minimal (~microseconds). Acceptable        | LOW   |
| `validatePhoneNumber()`              | Canonical comparison vs string comparison — negligible diff | LOW   |
| Multiple number parsing di broadcast | Parsing N numbers → O(N). Acceptable untuk <5000 recipients | LOW   |

### 4.9 Concurrency Risks

| Area                           | Risk                                              | Level             |
| ------------------------------ | ------------------------------------------------- | ----------------- |
| Phone format race condition    | Tidak ada — format number deterministic per input | NONE              |
| Concurrent DB lookup via phone | Format konsisten menghilangkan miss lookup        | LOW (improvement) |

### 4.10 Regression Scope

| Area                                | Why                                                                           | Level  |
| ----------------------------------- | ----------------------------------------------------------------------------- | ------ |
| **WhatsApp Web account management** | Register, QR scan, pairing, edit account — semua melewati phone normalization | FULL   |
| **Message send/receive**            | Inbound/outbound untuk existing Indonesia accounts                            | FULL   |
| **Broadcast**                       | Broadcast ke Indonesia numbers                                                | FULL   |
| **Contact lookup & creation**       | People service integration                                                    | FULL   |
| **Anti-spam system**                | Warming, rotation, broadcast humanization (walau belum developed)             | MEDIUM |
| **Account Groups & Reserved Pool**  | Account grouping logic                                                        | MEDIUM |

---

## 5. Dependency Analysis

### 5.1 Dependency Matrix

| Module                           | Depends On                                   | Dependency Type | Direction         |
| -------------------------------- | -------------------------------------------- | --------------- | ----------------- |
| `baileys.service.ts`             | `baileys.util.ts` (parsePhoneNumber)         | Direct import   | WA → Util         |
| `whatsapp-message.service.ts`    | `baileys.util.ts` (getWhatsAppId)            | Direct import   | WA → Util         |
| `whatsapp-connection.service.ts` | auth state (MongoDB keyed by phone)          | DB shared       | Connection → DB   |
| `baileys.dependencies.ts`        | `people-service` (upsertClientContact)       | gRPC sync       | WA → People       |
| `baileys.dependencies.ts`        | `channel-service` (getAccountChannelByPhone) | gRPC sync       | WA → Channel      |
| `conversation-service`           | inbound message → sender phone               | Event async     | WA → Conversation |
| `broadcast-service`              | `to` field phone formatting                  | gRPC sync       | Broadcast → WA    |

### 5.2 Shared Resources

| Resource                              | Type                | Shared By                              |
| ------------------------------------- | ------------------- | -------------------------------------- |
| `whatsapp-session-history` collection | MongoDB             | WhatsApp Web service                   |
| `client-contact` collection           | MongoDB             | People service                         |
| `account-channel` collection          | MongoDB             | Channel service                        |
| `conversation` collection             | MongoDB             | Conversation service                   |
| Auth state per phone (Baileys creds)  | MongoDB + encrypted | WhatsApp Web service                   |
| Cache keys by phone (Redis)           | Cache               | WhatsApp Web service + Channel service |

### 5.3 Event Mapping

| Event                | Producer             | Consumer(s)                        | Async Type |
| -------------------- | -------------------- | ---------------------------------- | ---------- |
| `message.inbound.*`  | WhatsApp Web         | Conversation service, Notification | RabbitMQ   |
| `message.outbound.*` | Conversation service | WhatsApp Web                       | RabbitMQ   |
| Contact upsert       | WhatsApp Web         | People service (via gRPC)          | gRPC sync  |

---

## 6. Risk Analysis

### 6.1 Risk Matrix

| Risk Scenario                                                                | Probability                        | Impact                                            | Severity | Priority | Mitigation                                                         |
| ---------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------ |
| **Number formatting mismatch** — non-62 number forced to 62 prefix           | HIGH (certain — existing code)     | CRITICAL — sendMessage fails, contact lookup miss | CRITICAL | P0       | ganti parsePhoneNumber dengan libphonenumber-js                    |
| **Data inconsistency** — existing DB sudah ada nomor non-62 dengan 62 prefix | LOW (asumsi belum ada user non-62) | MEDIUM — data corrupted                           | MEDIUM   | P2       | Audit DB sebelum deploy. Jika ada data salah, cleanup migration    |
| **QR validation false reject** — nomor non-62 tidak match karena format beda | HIGH                               | HIGH — user tidak bisa connect                    | HIGH     | P1       | validatePhoneNumber pakai canonical E.164 comparison               |
| **Broadcast partial failure** — nomor non-62 gagal di broadcast              | MEDIUM                             | HIGH — sebagian recipient tidak terima            | HIGH     | P1       | validateAndPrepareReceiver harus handle all country codes          |
| **Regression Indonesia flow** — existing akun +62 broken                     | MEDIUM                             | CRITICAL — all existing users affected            | CRITICAL | P0       | Comprehensive regression suite untuk +62 flow                      |
| **libphonenumber-js parsing error** — nomor valid tapi gagal di-parse        | LOW                                | MEDIUM — false validation reject                  | MEDIUM   | P2       | Fallback ke digit-only extraction jika parsing gagal               |
| **Concurrent update ke phone format** — service A dan B pakai format beda    | MEDIUM                             | HIGH — data inconsistency across services         | HIGH     | P1       | Implementasikan canonical E.164 utility di shared lib (common lib) |
| **Rollback diperlukan** — new format menyebabkan issue                       | MEDIUM                             | HIGH — perlu revert ke kode lama                  | HIGH     | P2       | Feature flag + backward compatible output                          |

### 6.2 Worst-Case Scenarios

| Scenario                                          | Impact                                              | Recovery                                        |
| ------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------- |
| All message sending to non-62 numbers fail        | Business loss, customer cannot be contacted via WA  | Rollback deploy, revert to old parsePhoneNumber |
| Existing Indonesia accounts disconnect loop       | All existing tenants affected — production incident | Rollback, restore auth state from backup        |
| Duplicate contacts created due to format mismatch | Data quality degradation                            | Merge contacts manually or via script           |

---

## 7. Test Strategy

### 7.1 Functional Test Scope

| Category             | Description                                | Count |
| -------------------- | ------------------------------------------ | ----- |
| Positive scenarios   | Valid phone numbers from various countries | 15    |
| Negative scenarios   | Invalid, empty, malformed phone numbers    | 8     |
| Validation scenarios | Boundary values, special characters        | 6     |
| Edge cases           | LID, group JIDs, leading zeros             | 8     |

### 7.2 Regression Test Scope

| Area                            | Scope                                         |
| ------------------------------- | --------------------------------------------- |
| WhatsApp Web account management | Full regression — register, QR, pairing, edit |
| Message send/receive Indonesia  | Full regression — existing +62 flow           |
| Broadcast Indonesia             | Full regression — broadcast ke +62 numbers    |
| Contact lookup via phone        | Full regression — people service integration  |
| Connection lifecycle            | Full regression — init, reconnect, disconnect |

### 7.3 Integration Test Scope

| Area                                                       | Scope                       |
| ---------------------------------------------------------- | --------------------------- |
| gRPC contract — SendMessage with international numbers     | All supported country codes |
| gRPC contract — GetInstance phoneNumber format             | E.164 without +             |
| Event — inbound message forwarding to conversation service | International sender JID    |
| Event — outbound message from conversation service         | International receiver JID  |
| Cross-service — people service contact upsert              | Phone format consistency    |

### 7.4 UAT Scenario Scope

| Scenario                                                  | Description                                 |
| --------------------------------------------------------- | ------------------------------------------- |
| Register WA account with US number (+1)                   | Full flow — QR scan, validate, send/receive |
| Register WA account with UK number (+44)                  | Full flow — QR scan, validate, send/receive |
| Agent sends message to international customer             | From conversation UI to WA                  |
| Agent receives message from international customer        | Inbound → appear in Inbox                   |
| Broadcast to mixed (Indonesia + international) recipients | All receive correctly                       |

### 7.5 Smoke Test Scope (P0)

| TC-ID        | Scenario                                  | Priority |
| ------------ | ----------------------------------------- | -------- |
| TC-WAINT-001 | parsePhoneNumber — Indonesia format +62   | P0       |
| TC-WAINT-002 | parsePhoneNumber — US format +1           | P0       |
| TC-WAINT-005 | sendMessage — Indonesia number            | P0       |
| TC-WAINT-006 | sendMessage — US number                   | P0       |
| TC-WAINT-018 | validatePhoneNumber — match Indonesia     | P0       |
| TC-WAINT-019 | validatePhoneNumber — match international | P0       |
| TC-WAINT-032 | Broadcast — all Indonesia recipients      | P0       |
| TC-WAINT-033 | Broadcast — mixed country codes           | P0       |

### 7.6 Automation Candidates

| TC-ID               | Reason                                                    | Ready           |
| ------------------- | --------------------------------------------------------- | --------------- |
| TC-WAINT-001 to 012 | Unit tests — deterministic, fast, no external dependency  | ✅              |
| TC-WAINT-018 to 025 | Validation unit tests — pure logic                        | ✅              |
| TC-WAINT-013 to 017 | Integration tests — need gRPC mock or staging WA instance | ⚠️ Need staging |
| TC-WAINT-026 to 031 | Connection tests — need real WA instance                  | ❌ Manual       |

---

## 8. Test Case Specification

### Test Suite Organization

```
Feature: WhatsApp International Number Support (WAINT)
├── P0 — Smoke (critical path, gate)
│   ├── TC-WAINT-001, 002, 005, 006, 018, 019, 032, 033
├── P1 — Regression (core behavior)
│   ├── TC-WAINT-003, 004, 007, 008, 013, 014, 020, 021, 022, 026, 027, 034, 035
├── P2 — Edge Cases (boundary, concurrency)
│   ├── TC-WAINT-009, 010, 011, 015, 016, 017, 023, 024, 028, 029, 030, 036
└── P3 — Negative & Error Handling
│   ├── TC-WAINT-012, 025, 031, 037, 038
```

---

### A. Unit Tests — `baileys.util.ts` (`parsePhoneNumber`)

| TC-ID        | Scenario                          | Req ID       | Level | Priority | Precondition | Test Data             | Steps                                         | Expected Result              |
| ------------ | --------------------------------- | ------------ | ----- | -------- | ------------ | --------------------- | --------------------------------------------- | ---------------------------- |
| TC-WAINT-001 | Indonesia valid +62               | BR-01, AC-01 | Unit  | P0       | None         | `"+628123456789"`     | 1. Call parsePhoneNumber("+628123456789")     | Returns `"628123456789"`     |
| TC-WAINT-002 | US/Canada valid +1                | BR-01, AC-02 | Unit  | P0       | None         | `"+14155552671"`      | 1. Call parsePhoneNumber("+14155552671")      | Returns `"14155552671"`      |
| TC-WAINT-003 | UK valid +44                      | BR-01        | Unit  | P1       | None         | `"+442071234567"`     | 1. Call parsePhoneNumber("+442071234567")     | Returns `"442071234567"`     |
| TC-WAINT-004 | India valid +91                   | BR-01        | Unit  | P1       | None         | `"+919876543210"`     | 1. Call parsePhoneNumber("+919876543210")     | Returns `"919876543210"`     |
| TC-WAINT-005 | Indonesia local format (0 prefix) | BR-02, AC-02 | Unit  | P0       | None         | `"08123456789"`       | 1. Call parsePhoneNumber("08123456789")       | Returns `"628123456789"`     |
| TC-WAINT-006 | US local format (no +)            | BR-01        | Unit  | P0       | None         | `"14155552671"`       | 1. Call parsePhoneNumber("14155552671")       | Returns `"14155552671"`      |
| TC-WAINT-007 | UK local format (0 prefix)        | BR-01        | Unit  | P1       | None         | `"02071234567"`       | 1. Call parsePhoneNumber("02071234567")       | Returns `"442071234567"`     |
| TC-WAINT-008 | India local format (0 prefix)     | BR-01        | Unit  | P1       | None         | `"09876543210"`       | 1. Call parsePhoneNumber("09876543210")       | Returns `"919876543210"`     |
| TC-WAINT-009 | China +86                         | BR-01        | Unit  | P2       | None         | `"+861012345678"`     | 1. Call parsePhoneNumber("+861012345678")     | Returns `"861012345678"`     |
| TC-WAINT-010 | Brazil +55                        | BR-01        | Unit  | P2       | None         | `"+5511912345678"`    | 1. Call parsePhoneNumber("+5511912345678")    | Returns `"5511912345678"`    |
| TC-WAINT-011 | Australia +61                     | BR-01        | Unit  | P2       | None         | `"+61212345678"`      | 1. Call parsePhoneNumber("+61212345678")      | Returns `"61212345678"`      |
| TC-WAINT-012 | Empty string                      | BR-01        | Unit  | P3       | None         | `""`                  | 1. Call parsePhoneNumber("")                  | Throws error (invalid phone) |
| TC-WAINT-037 | Special characters mixed          | BR-01        | Unit  | P3       | None         | `"+1 (415) 555-2671"` | 1. Call parsePhoneNumber("+1 (415) 555-2671") | Returns `"14155552671"`      |
| TC-WAINT-038 | Too short number                  | BR-01        | Unit  | P3       | None         | `"+12345"`            | 1. Call parsePhoneNumber("+12345")            | Throws error (< 8 digits)    |

### B. Unit Tests — `baileys.util.ts` (`getWhatsAppId`)

| TC-ID        | Scenario                | Req ID | Level | Priority | Precondition           | Test Data                      | Steps                                               | Expected Result                                      |
| ------------ | ----------------------- | ------ | ----- | -------- | ---------------------- | ------------------------------ | --------------------------------------------------- | ---------------------------------------------------- |
| TC-WAINT-013 | Standard JID Indonesia  | BR-06  | Unit  | P1       | parsePhoneNumber works | `"628123456789"`               | 1. Call getWhatsAppId("628123456789")               | Returns `"628123456789@s.whatsapp.net"`              |
| TC-WAINT-014 | Standard JID US         | BR-06  | Unit  | P1       | parsePhoneNumber works | `"14155552671"`                | 1. Call getWhatsAppId("14155552671")                | Returns `"14155552671@s.whatsapp.net"`               |
| TC-WAINT-015 | Already a group JID     | BR-06  | Unit  | P2       | None                   | `"62812@g.us"`                 | 1. Call getWhatsAppId("62812@g.us")                 | Returns `"62812@g.us"` (passthrough)                 |
| TC-WAINT-016 | Already a standard JID  | BR-06  | Unit  | P2       | None                   | `"14155552671@s.whatsapp.net"` | 1. Call getWhatsAppId("14155552671@s.whatsapp.net") | Returns `"14155552671@s.whatsapp.net"` (passthrough) |
| TC-WAINT-017 | Group JID — long number | BR-06  | Unit  | P2       | None                   | `"1415555267112345678"`        | 1. Call getWhatsAppId("1415555267112345678")        | Returns `"1415555267112345678@g.us"`                 |

### C. Unit Tests — `baileys.service.ts` / `whatsapp-message.service.ts` (`getPhoneNumber`)

| TC-ID        | Scenario                   | Req ID | Level | Priority | Precondition | Test Data                       | Steps                       | Expected Result          |
| ------------ | -------------------------- | ------ | ----- | -------- | ------------ | ------------------------------- | --------------------------- | ------------------------ |
| TC-WAINT-043 | Extract from Indonesia JID | BR-01  | Unit  | P2       | None         | `"628123456789@s.whatsapp.net"` | 1. Call getPhoneNumber(...) | Returns `"628123456789"` |
| TC-WAINT-044 | Extract from US JID        | BR-01  | Unit  | P2       | None         | `"14155552671@s.whatsapp.net"`  | 1. Call getPhoneNumber(...) | Returns `"14155552671"`  |
| TC-WAINT-045 | Extract from group JID     | BR-01  | Unit  | P2       | None         | `"12345@g.us"`                  | 1. Call getPhoneNumber(...) | Returns `"12345"`        |
| TC-WAINT-046 | Extract from LID           | BR-01  | Unit  | P2       | None         | `"1294934029:132@lid"`          | 1. Call getPhoneNumber(...) | Returns `"1294934029"`   |
| TC-WAINT-047 | Invalid JID format         | BR-01  | Unit  | P3       | None         | `"not-a-jid"`                   | 1. Call getPhoneNumber(...) | Returns `""`             |

### D. Unit Tests — `baileys.service.ts` (`validatePhoneNumber`)

| TC-ID        | Scenario                    | Req ID | Level | Priority | Precondition | Test Data                                                | Steps                                                      | Expected Result |
| ------------ | --------------------------- | ------ | ----- | -------- | ------------ | -------------------------------------------------------- | ---------------------------------------------------------- | --------------- |
| TC-WAINT-018 | Match Indonesia same format | BR-04  | Unit  | P0       | None         | expected: `"628123456789"`, actual: `"628123456789"`     | 1. Call validatePhoneNumber(expected, actual)              | Returns `true`  |
| TC-WAINT-019 | Match Indonesia diff format | BR-04  | Unit  | P0       | None         | expected: `"+628123456789"`, actual: `"628123456789"`    | 1. validatePhoneNumber("+628123456789", "628123456789")    | Returns `true`  |
| TC-WAINT-020 | Match US diff format        | BR-04  | Unit  | P1       | None         | expected: `"14155552671"`, actual: `"+14155552671"`      | 1. validatePhoneNumber("14155552671", "+14155552671")      | Returns `true`  |
| TC-WAINT-021 | Mismatch Indonesia          | BR-04  | Unit  | P1       | None         | expected: `"628123456789"`, actual: `"628987654321"`     | 1. validatePhoneNumber("628123456789", "628987654321")     | Returns `false` |
| TC-WAINT-022 | Mismatch international      | BR-04  | Unit  | P1       | None         | expected: `"14155552671"`, actual: `"14155552672"`       | 1. validatePhoneNumber("14155552671", "14155552672")       | Returns `false` |
| TC-WAINT-023 | Match with special chars    | BR-04  | Unit  | P2       | None         | expected: `"14155552671"`, actual: `"+1 (415) 555-2671"` | 1. validatePhoneNumber("14155552671", "+1 (415) 555-2671") | Returns `true`  |

### E. Integration Tests — Message Send Flow

| TC-ID        | Scenario                          | Req ID       | Level       | Priority | Precondition              | Test Data                                                           | Steps                                                      | Expected Result                                       |
| ------------ | --------------------------------- | ------------ | ----------- | -------- | ------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| TC-WAINT-024 | Send to Indonesia number          | AC-03, BR-06 | Integration | P1       | Authenticated WA instance | `{to: "628123456789", text: "Hello"}`                               | 1. Call sendMessage 2. Verify JID used                     | JID = `"628123456789@s.whatsapp.net"`, status success |
| TC-WAINT-025 | Send to US number                 | AC-03, BR-06 | Integration | P1       | Authenticated WA instance | `{to: "14155552671", text: "Hello"}`                                | 1. Call sendMessage 2. Verify JID used                     | JID = `"14155552671@s.whatsapp.net"`, status success  |
| TC-WAINT-026 | Send using referenceId (full JID) | BR-06        | Integration | P2       | Authenticated WA instance | referenceId: `"14155552671@s.whatsapp.net"`                         | 1. Call sendMessage with referenceId 2. Verify passthrough | Tidak di-parse ulang, message terkirim                |
| TC-WAINT-027 | Send to multiple country codes    | AC-06        | Integration | P2       | Authenticated WA instance | `[{to: "628123456789"}, {to: "14155552671"}, {to: "442071234567"}]` | 1. Kirim 3 pesan 2. Verify JIDs                            | Semua JID benar, semua terkirim                       |

### F. Integration Tests — Connection & Auth

| TC-ID        | Scenario                            | Req ID | Level       | Priority | Precondition                    | Test Data                | Steps                                           | Expected Result                                                               |
| ------------ | ----------------------------------- | ------ | ----------- | -------- | ------------------------------- | ------------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| TC-WAINT-028 | QR scan with US number              | AC-04  | Integration | P2       | WA instance + QR                | US number `+14155552671` | 1. InitInstance 2. Scan QR 3. Verify validation | validatePhoneNumber match, auth state with `"14155552671"`, stable connection |
| TC-WAINT-029 | Reconnect international account     | BR-04  | Integration | P2       | Previously connected US account | None                     | 1. Restart service 2. Verify connection         | Auth state loaded correctly, connection restored                              |
| TC-WAINT-030 | QR scan with Indonesia (regression) | BR-02  | Integration | P2       | WA instance + QR                | Indonesia number         | 1. InitInstance 2. Scan QR                      | Existing flow not broken                                                      |

### G. Integration Tests — Contact Lookup & Store

| TC-ID        | Scenario                            | Req ID | Level       | Priority | Precondition      | Test Data                                         | Steps                                                               | Expected Result                                                   |
| ------------ | ----------------------------------- | ------ | ----------- | -------- | ----------------- | ------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| TC-WAINT-031 | Inbound message from US number      | AC-05  | Integration | P2       | WA instance       | Message from `"14155552671@s.whatsapp.net"`       | 1. Receive message 2. Check resolveJid 3. Check upsertClientContact | resolveJid → `"14155552671"`, upsert dengan phone `"14155552671"` |
| TC-WAINT-032 | Inbound from Indonesia (regression) | BR-02  | Integration | P0       | WA instance       | Message from `"628123456789@s.whatsapp.net"`      | 1. Receive message                                                  | Flow normal tetap bekerja                                         |
| TC-WAINT-033 | Contact lookup mixed country codes  | AC-05  | Integration | P1       | Multiple contacts | `["628123456789", "14155552671", "442071234567"]` | 1. Lookup each contact                                              | Semua ditemukan dengan format benar                               |

### H. Integration Tests — Broadcast

| TC-ID        | Scenario                                 | Req ID | Level       | Priority | Precondition              | Test Data                                                      | Steps                                       | Expected Result                        |
| ------------ | ---------------------------------------- | ------ | ----------- | -------- | ------------------------- | -------------------------------------------------------------- | ------------------------------------------- | -------------------------------------- |
| TC-WAINT-034 | Broadcast to Indonesia only (regression) | BR-02  | Integration | P1       | Authenticated WA instance | Recipients: `["628123456789", "628987654321"]`                 | 1. sendBroadcastMessage                     | Semua terkirim sukses                  |
| TC-WAINT-035 | Broadcast mixed country codes            | AC-06  | Integration | P1       | Authenticated WA instance | Recipients: `["628123456789", "14155552671", "442071234567"]`  | 1. sendBroadcastMessage                     | Semua recipient dapat pesan, JID benar |
| TC-WAINT-036 | Broadcast validation                     | BR-01  | Integration | P2       | Authenticated WA instance | Valid: `["+14155552671", "628123456789"]`, Invalid: `["abcd"]` | 1. sendBroadcastMessage 2. Check validation | Valid diteruskan, invalid ditolak      |

### I. Edge Case & Negative Tests

| TC-ID        | Scenario                       | Req ID | Level       | Priority | Precondition | Test Data                      | Steps                               | Expected Result                  |
| ------------ | ------------------------------ | ------ | ----------- | -------- | ------------ | ------------------------------ | ----------------------------------- | -------------------------------- |
| TC-WAINT-039 | Null phone number              | BR-01  | Unit        | P3       | None         | `null`                         | 1. Call parsePhoneNumber(null)      | Throws error                     |
| TC-WAINT-040 | Undefined phone number         | BR-01  | Unit        | P3       | None         | `undefined`                    | 1. Call parsePhoneNumber(undefined) | Throws error                     |
| TC-WAINT-041 | LID resolve international user | BR-06  | Integration | P2       | WA instance  | LID JID for international user | 1. resolveJid to phone              | Mapped to correct non-62 phone   |
| TC-WAINT-042 | Invalid JID in getPhoneNumber  | BR-01  | Unit        | P3       | None         | `"12345"@invalid`              | 1. Call getPhoneNumber              | Handled gracefully, returns `""` |

---

## 9. Production Safety

### 9.1 Rollback Strategy

| Step | Action                                            | Details                                   |
| ---- | ------------------------------------------------- | ----------------------------------------- |
| 1    | Revert `baileys.util.ts` to previous version      | `git revert` for parsePhoneNumber changes |
| 2    | Revert `validatePhoneNumber` to string comparison | Restore old validation logic              |
| 3    | Deploy rollback                                   | Standard deployment process               |
| 4    | Verify existing +62 accounts                      | Smoke test all critical paths             |

### 9.2 Feature Flag

| Flag                           | Type         | Default     | Purpose                                                    |
| ------------------------------ | ------------ | ----------- | ---------------------------------------------------------- |
| `international_number_support` | boolean flag | `true` (on) | If issue found, toggle off to fallback to old +62 behavior |

### 9.3 Backward Compatibility

| Aspect                       | Backward Compatible? | Notes                                                                            |
| ---------------------------- | -------------------- | -------------------------------------------------------------------------------- |
| API contract (protobuf)      | ✅ Yes               | No field change, only value semantics                                            |
| Stored data format           | ⚠️ Partial           | Existing data with forced 62 prefix remains as-is. New data uses correct format. |
| Existing +62 accounts        | ✅ Yes               | Same input produces same output                                                  |
| Downstream service consumers | ✅ Yes               | Phone number values may change for non-62 (from wrong to correct)                |

### 9.4 Monitoring & Alerting Needs

| Metric                              | Alert   | Threshold                   |
| ----------------------------------- | ------- | --------------------------- |
| `sendMessage` failure rate          | Pager   | >5% increase from baseline  |
| `parsePhoneNumber` error rate       | Warning | >0.1%                       |
| `validatePhoneNumber` mismatch rate | Info    | >10% of connection attempts |
| Broadcast partial failure           | Pager   | Any failure                 |

### 9.5 Logging & Audit Gaps

| Gap                                                  | Recommendation                                                       |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| Tidak ada log untuk phone normalization result       | Add structured log: `[parsePhoneNumber] input=X output=Y country=US` |
| Tidak ada metric untuk phone validation success/fail | Add counter metric per country code                                  |

---

## 10. Open Questions

| #   | Question                                                                               | Owner          | Status |
| --- | -------------------------------------------------------------------------------------- | -------------- | ------ |
| 1   | Apakah `+` prefix harus di-accept di `sendMessage.to`?                                 | PM/Engineering | Open   |
| 2   | Bagaimana handling nomor non-62 yang sudah terlanjur tersimpan di DB?                  | Engineering    | Open   |
| 3   | Apakah perlu update FE phone input mask?                                               | FE team        | Open   |
| 4   | Apakah `libphonenumber-js` diijinkan sebagai dependency?                               | Engineering    | Open   |
| 5   | Apakah ada rencana support country code specifik (prioritas)? (misal: US, UK, SG dulu) | PM             | Open   |
| 6   | Apa fallback behavior jika `libphonenumber-js` gagal parse nomor valid?                | Engineering    | Open   |

---

## 11. Traceability Matrix

| Req ID | Requirement                          | Finding                                     | Impact Area                              | Test Case                   | Status             |
| ------ | ------------------------------------ | ------------------------------------------- | ---------------------------------------- | --------------------------- | ------------------ |
| BR-01  | Normalisasi E.164 tanpa `+`          | parsePhoneNumber hardcoded +62              | baileys.util.ts                          | TC-WAINT-001 s.d 012        | ❌ Not implemented |
| BR-02  | Indonesia +62 tetap berfungsi        | Existing flow harus regression tested       | All WA modules                           | TC-WAINT-005, 030, 032, 034 | ⚠️ Need regression |
| BR-03  | Non-62 accepted                      | No current support                          | baileys.util.ts                          | TC-WAINT-002, 003, 004      | ❌ Not implemented |
| BR-04  | Canonical phone validation           | validatePhoneNumber string comparison       | baileys.service.ts                       | TC-WAINT-018 s.d 023        | ❌ Not implemented |
| BR-05  | Format konsisten cross-service       | Multiple lookup points                      | baileys.dependencies.ts, people, channel | TC-WAINT-031, 033           | ❌ Not implemented |
| BR-06  | Valid JID semua country              | getWhatsAppId dependent on parsePhoneNumber | baileys.util.ts                          | TC-WAINT-013 s.d 017        | ❌ Not implemented |
| AC-01  | parsePhoneNumber(+1415...) = 1415... | Hardcoded +62                               | baileys.util.ts                          | TC-WAINT-002                | ❌ Not implemented |
| AC-02  | parsePhoneNumber(0812...) = 62812... | Existing behavior                           | baileys.util.ts                          | TC-WAINT-005                | ✅ Working         |
| AC-03  | sendMessage international works      | JID construction broken                     | whatsapp-message.service.ts              | TC-WAINT-024, 025           | ❌ Not implemented |
| AC-04  | QR scan international                | validatePhoneNumber mismatch                | baileys.service.ts                       | TC-WAINT-028                | ❌ Not implemented |
| AC-05  | Contact lookup all country           | Format dependency chain                     | baileys.dependencies.ts                  | TC-WAINT-031, 033           | ❌ Not implemented |
| AC-06  | Broadcast mixed country              | Receiver validation                         | whatsapp-message.service.ts              | TC-WAINT-035                | ❌ Not implemented |
| AC-07  | Existing Indonesia regression        | No regression                               | All WA                                   | TC-WAINT-030, 032, 034      | ⚠️ Need regression |

---

## 12. Recommendation

| Item                  | Assessment                                                                                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Go / No-Go**        | **Conditional Go** — setelah mitigasi berikut diterapkan                                                                                                                                           |
| **Critical Path**     | 1. Implement `libphonenumber-js` di `parsePhoneNumber()` 2. Update `validatePhoneNumber()` ke canonical E.164 compare 3. Comprehensive test suite (P0 + P1) 4. Regression test all Indonesia flows |
| **Key Risks**         | Regression Indonesia flow (P0 mitigate), data inconsistency existing DB                                                                                                                            |
| **Deployment**        | Feature flag `international_number_support` — canary deploy ke staging selama 1 hari                                                                                                               |
| **Timeline Estimate** | Development: 3-5 hari. Testing: 2-3 hari. Total: ~1 sprint                                                                                                                                         |
