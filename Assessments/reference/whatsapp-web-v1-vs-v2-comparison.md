# WhatsApp Web PRD V1 vs V2 vs FE Implementation Comparison

> **Sumber FE:** `C:\Users\MyBook SAGA 12\Desktop\FE satuinbox\omnichannel-satuinbox-fe\apps\omnichannel`
> **Dibuat:** 2026-05-25

---

## Ringkasan

WA Web V1: 6 file — basic account management (add, edit, scan QR, groups, import mode, overview).  
WA Web V2: 11 file — V1 features enhanced + **5 file Anti Spam System baru** (broadcast humanization, warming, conversation engine, account pools, technical guide).

---

## Feature Mapping

| # | Feature | V1 | V2 | FE Status | BE/FE | Notes |
|---|---------|----|----|-----------|-------|-------|
| 1 | **Add Account** (bulk add, QR, pairing code) | ✅ V1 file 1 | ✅ V2 file 2 (v2.2) | ✅ **Developed** | Both | `WhatsappWebAddModal`, `useAddAccountChannelForm` |
| 2 | **Bulk Scan QR** (dedicated popup) | ✅ V1 file 2 | ✅ V2 file 3 (NEW flow) | ⚠️ **Partial** | FE+BE | Single QR connect exists (`WhatsappWebConnectModal`), but dedicated bulk scan popup with queue navigation not found |
| 3 | **Edit Account** | ✅ V1 file 3 | ✅ V2 file 5 (slot-level) | ✅ **Developed** | Both | Rename account exists, slot status display |
| 4 | **Account Groups** | ✅ V1 file 4 | ✅ V2 file 4 (v2.1) | ✅ **Developed** | Both | `TabAccountGroup`, groups CRUD, set main account, move between groups |
| 5 | **Reserved Pool** | ❌ | ✅ V2 file 4 | ✅ **Developed** | Both | `TabReservedAccount`, move to/from groups |
| 6 | **Rename & Clear Name** | ❌ | ✅ V2 file 4 | ✅ **Developed** | FE | `RenameAccountModal` |
| 7 | **Import Modes** (Full/Whitelist/Exclude) | ✅ V1 file 5 | ✅ V2 file 6 (NEW queue) | ❌ **Not found in FE** | BE-heavy | No `import_mode` code found. Mostly BE import filtering logic |
| 8 | **Architecture/Overview** | ✅ V1 file 6 | ✅ V2 file 1 | — | Both | Document-level only |
| 9 | **Broadcast Humanization** (bubble split, self-quote) | ❌ | ✅ Anti Spam file 1 | ❌ **Not found in FE** | **Mostly BE** | Broadcast delivery worker feature |
| 10 | **Private Bot Farm Warming** | ❌ | ✅ Anti Spam file 2 | ❌ **Not found in FE** | **Mostly BE** | Backend scheduling engine |
| 11 | **Warming Conversation Engine** (topology, content) | ❌ | ✅ Anti Spam file 3 | ❌ **Not found in FE** | **Mostly BE** | Backend transcript generation |
| 12 | **Account Pools & Rotation** (General/Group/Backup) | ❌ | ✅ Anti Spam file 4 | ❌ **Not found in FE** | Both | Extends Account Groups V2 file 4 |
| 13 | **Anti Spam Technical Guide** (timing, ban recovery) | ❌ | ✅ Anti Spam file 5 | ❌ **Not found in FE** | **Pure BE** | Implementation guide only |

---

## Implementation Status (FE + BE v2.5.0)

### ✅ Developed (Confirmed in FE + BE)

| Feature | FE | BE | V2 Source | BE Evidence |
|---------|----|----|-----------|-------------|
| **Add Account** | ✅ | ✅ | V2 file 2 | `createAccountChannel`, `InitInstance` gRPC |
| **QR Connect** | ✅ | ✅ | V2 file 2, 3 | `GetQRCode`, `GetInstance`, 30s refresh |
| **Account Groups** | ✅ | ✅ | V2 file 4 | `account-channel-group` CRUD endpoints |
| **Reserved Pool** | ✅ | ✅ | V2 file 4 | Group management + reserved account handling |
| **Rename/Edit** | ✅ | ✅ | V2 file 4, 5 | `renameAccountChannel` gRPC |
| **Statistic Cards** | ✅ | ✅ | V2 file 4 | `getAccountChannelSummary` |
| **Baileys connector** | N/A | ✅ | V2 file 1 | `baileys.service.ts` — core library |
| **Session management** | N/A | ✅ | V2 file 1 | `session.service.ts`, `whatsapp-connection.service.ts` |
| **Credential persistence** | N/A | ✅ | V2 file 1 | Encrypted auth, auto-restore |
| **Human-like send** | N/A | ✅ | V2 file 1 | Typing indicators, random delays |

### ⚠️ Partially Developed

| Feature | FE | BE | What's Missing | V2 Source |
|---------|----|----|---------------|-----------|
| **Bulk Scan Popup** | ⚠️ Partial | ⚠️ Partial | Dedicated popup with queue navigation (Next/Previous/Skip), "Bulk Scan All" sequential auto-advance | V2 file 3 |
| **Pairing Code** | ❌ | ❌ | QR/Pairing Code toggle in scan UI | V2 file 2, 3 |
| **Public Temp Links** | ❌ | ❌ | Single-use HTTPS links, 10-min TTL, remote scanning | V2 file 2 |
| **Account Name dropdown** | ❌ | ❌ | Searchable dropdown with inline "Add new" (FE still free-text) | V2 file 2 |
| **Auto-switch sessions** | N/A | ⚠️ Partial | BE has basic session recovery, but multi-slot failover not explicit | V2 file 1 |
| **Backup Numbers rotator** | ❌ | ❌ | Broadcast Rotator by count/schedule not found | V2 file 1, 2 |

### ❌ Not Found in FE or BE

| Feature | FE | BE | Notes | V2 Source |
|---------|----|----|-------|-----------|
| **Import Modes** | ❌ | ❌ **Not in BE** | No import-mode module, service, or schema in `whatsapp/` | V2 file 6 |
| **Broadcast Humanization** | ❌ | ❌ **Not in BE** | No bubble-split/self-quote in `broadcast-service/` | Anti Spam file 1 |
| **Warming System** | ❌ | ❌ **Not in BE** | No warming engine, topology, or transcript gen | Anti Spam file 2, 3 |
| **Account Pools Rotation** | ❌ | ❌ **Not in BE** | No auto-rotation or eligibility logic | Anti Spam file 4 |
| **Anti Spam Pipeline** | ❌ | ❌ **Not in BE** | No structured anti-spam pipeline with timing formulas | Anti Spam file 5 |
| **Multi-library auto-switch** | N/A | ❌ | Baileys primary only. WhatsAppWebJS backup not found | V2 file 1 |

---

## Quantitative Summary

| Metric | V1 | V2 | FE (v2.5.0) | BE (v2.5.0) |
|--------|----|----|-------------|-------------|
| Jumlah file | 6 | 11 | ~68 files related | — |
| Fitur match dengan V2 | ~60% | — | ~70% | ~70% |
| Fitur baru di V2 | 0 | 7 (Reserved Pool, Rename, +5 Anti Spam) | 2/7 developed | 2/7 developed |
| FE-visible gaps dari V2 | — | 4 (Bulk Scan, Pairing Code, Public Links, Dropdown) | ⚠️ Partial | ⚠️ Partial |
| **Anti Spam System** | — | 5 files | ❌ | ❌ |
| **Import Modes** | — | 1 file | ❌ | ❌ |

---

## Kesimpulan

1. **V2 supersedes V1** — semua fitur V1 ada di V2 dengan enhancement. V2 nambah 2 fitur non-anti-spam (Reserved Pool, Rename Name) + 5 file Anti Spam System.

2. **FE sudah mencakup ~70% fitur V2 yang FE-visible**, dengan detail:
   - ✅ Account Groups & Reserved Pool — full match
   - ✅ Add Account — match (except dropdown naming)
   - ✅ QR Connect — match (single account)
   - ✅ Edit/Rename — match
   - ⚠️ Bulk Scan Popup — partial (single QR connect ada, bulk queue belum)
   - ❌ Import Modes — **not in FE** (kemungkinan BE-side feature)
   - ❌ Anti Spam System — **not in FE** (mostly BE-side: warming, humanization, rotation)

3. **Semua fitur V2 yang belum di FE juga belum di BE:**
   - Import Modes, Anti Spam (Broadcast Humanization, Warming, Account Pools Rotation) — **tidak ditemukan di BE repo**
   - Berarti fitur-fitur ini **belum tersentuh sama sekali** (FE maupun BE)

4. **FE-visible gaps dari V2 (4 item):**
   - **Bulk Scan QR popup** (V2 file 3) — dedicated popup with queue navigation
   - **Pairing Code toggle** (V2 file 2) — alternative to QR scan
   - **Public temporary links** (V2 file 2) — remote scanning
   - **Account Name dropdown** (V2 file 2) — searchable with inline "Add new"

5. **Anti Spam System & Import Modes: ❌ NOT in BE either.**
   - Setelah cross-check ke BE repo `omnichannel-satuinbox-be`:
     - **Import Modes (V2 file 6):** Tidak ditemukan di `whatsapp/` service. No import-mode module/schema/controller.
     - **Broadcast Humanization (Anti Spam file 1):** Tidak ditemukan di `broadcast-service/`. No bubble-split or self-quote logic.
     - **Warming System (Anti Spam file 2, 3):** Tidak ditemukan. No warming engine or topology.
     - **Account Pools Rotation (Anti Spam file 4):** Tidak ditemukan. No auto-rotation logic.
   - **Kesimpulan:** Semua fitur Anti Spam dan Import Modes **belum developed di sisi mana pun (FE maupun BE)**.

6. **Yang sudah dikonfirmasi di BE:**
   - ✅ Baileys connector (`baileys.service.ts`) — core WhatsApp Web library
   - ✅ Session management (`session.service.ts`, `whatsapp-connection.service.ts`)
   - ✅ QR code generation (`GetQRCode` gRPC)
   - ✅ Instance lifecycle (`InitInstance`, `StopInstance`, `LogoutInstance`)
   - ✅ Human-like send simulation (typing indicators, random delays in baileys.service.ts)
   - ✅ Credential persistence (encrypted auth)

7. **Rekomendasi:**
   - V2 sebagai source of truth untuk WA Web
   - Anti Spam System dan Import Modes **benar-benar belum developed di FE maupun BE** — perlu timeline dari PM
   - 4 FE-visible gaps perlu dikonfirmasi PM: apakah sengaja ditunda atau belum dikerjakan
