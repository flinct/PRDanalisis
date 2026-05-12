# **Product Requirement Document (PRD)**

**Feature:** Edit WhatsApp Account  
**Author** : Yusril Ibnu Maulana  
**Product Manager**: Aryo  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Enhance Edit WhatsApp Account to give Admins & Supervisors full visibility of account status per connection type & device slot, allow quick connect if inactive, manage automation configs (Auto Move, Backup Numbers, Rotator), and enable public link sharing of QR/Pairing for remote scan. |
| **Key Capabilities** | Pre-filled form, edit metadata (name, status, welcome message, foto, posisi, auto move), configure backup & rotator, granular session status per connect/device slot, auto-popup connect flow when inactive, slot states (Aktif/Disconnected/Tidak di set), Log Out / Disconnect / Delete, inline navigation (Next/Previous), public link sharing per slot or per akun. |
| **Outcome** | Clearer lifecycle visibility, faster recovery from inactive state, consistent automation updates, and easier external collaboration. |

---

## **2 | Problem Statement**

| \# | Problem Description |
| ----- | ----- |
| 1 | No granular visibility of which connect/device slots are active. |
| 2 | No quick flow to reactivate inactive accounts. |
| 3 | No distinction between empty vs disconnected slots. |
| 4 | Difficult to share QR/Pairing externally for onboarding help. |

---

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Provide granular account visibility | 100% accounts display slot-level status correctly. |
| Enable fast reactivation | ≥ 90% inactive accounts reconnected within 5 min via popup flow. |
| Clarify slot state | 100% empty slots display “Tidak di set” vs disconnected \= ❌. |
| Improve shareability | ≥ 70% admins use public link feature for external scanning. |

---

## **4 | User Stories & Acceptance Criteria**

### **Metadata & Info**

| Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| **P0** | As an Admin/Supervisor, I want to edit the **Name** of a WA account. | – Pre-filled, editable, required ≤ 50 chars. |
| **P0** | As an Admin/Supervisor, I want to update the **Status/Bio**. | – Optional, editable, ≤ 100 chars. |
| **P0** | As an Admin/Supervisor, I want to manage the **Profile Photo**. | – Upload jpg/png ≤ 2 MB, delete option. |
| **P0** | As an Admin/Supervisor, I want to manage the **Welcome Message** (only WA Business). | – Text area ≤ 512 chars. – Toggle ON/OFF. – Hidden for non-Business. |

### **Account Status**

| Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| **P0** | As an Admin, I want to see account status per connect type & slot. | – Status card shows breakdown: **Main Connect – Device 1**: Aktif/Tidak Aktif/Tidak di set **Main Connect – Device 2**: … **Backup Connect – Device 1**: … **Backup Connect – Device 2**: … |
| **P0** | As an Admin, I want clearer differentiation of slots not set vs disconnected. | – If slot never set → show *“Tidak di set”*. – If previously active but disconnected → show ❌ **“Disconnected”**. |

### **Inactive Handling**

| Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| **P0** | As an Admin, I want to be prompted to connect when account inactive. | – If Account Status \= Tidak Aktif → popup **“Hubungkan Akun WhatsApp”** appears with QR/Pairing option. – Popup enters queue connect wizard like Add Account flow. – On success → update slot & Account Status \= Aktif. |

### **Public Share**

| Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| **P1** | As an Admin, I want to share account connect info via link. | – Button **“Bagikan Link Koneksi Akun ke Publik”**. – Generates one-time or time-limited (default 10 min) link. – Link opens QR/Pairing Code for this account only. |

### **Navigation**

| Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| **P1** | As an Admin/Supervisor, I want **Next/Previous** navigation in modal. | – Buttons **“\< Sebelumnya”** and **“Berikutnya \>”**. – Switch directly between account edit views without closing modal. – Save prompt if current changes unsaved. |

### **Permissions**

| Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| **P0** | As an Admin, I can edit all accounts. | – Full access to metadata, auto-move, session, delete. |
| **P1** | As a Supervisor, I can edit only accounts in my Team Inbox. | – Attempt outside scope → error **“Pilih Team Inbox Anda”**. |
| **P2** | As an Agent, I cannot edit accounts. | – Button hidden. – Direct access → **“Akses ditolak”**. |

### **Lifecycle Actions**

| Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| **P0** | As an Admin, I want to disconnect or delete the account. | – Button **“Putuskan & Hapus”**. – Confirmation modal → “Apakah Anda yakin?”. – On confirm → terminate all sessions & remove account. |
| **P0** | As an Admin/Supervisor, I want to log out active session. | – If slot is Aktif → show **Log Out** button beside it. – Confirmation required. |

## **5 | Field-Level Details & Validation**

| Field | Type | Validation | Example |
| ----- | ----- | ----- | ----- |
| **Name** | String | Required, ≤ 50 chars | “WA Support 1” |
| **Status/Bio** | String | Optional, ≤ 100 chars | “Customer Care” |
| **Phone Number** | String (read-only) | Not editable | \+62 812 3456 7890 |
| **Profile Photo** | File | jpg/png ≤ 2MB | support.png |
| **Welcome Message** | Text | ≤ 512 chars, only for WA Business | “Halo\! Ada yang bisa kami bantu?” |
| **Position** | Enum | Cadangan / Gunakan | Gunakan |
| **Auto Move** | Boolean \+ Team Inbox ID | Required if ON | Inbox-123 |
| **Backup Numbers** | Array | Cannot overlap Auto Move | \[WA2, WA3\] |
| **Rotator Config** | Object | count, days | {count: 500, days: 3} |
| **Connect Slots** | Object | Main/Backup × Device 1/2 | {main1: Aktif, backup2: “Tidak di set”} |
| **Account Status** | Enum | Aktif / Tidak Aktif | Aktif |

---

## **6 | UX Flow**

1. User clicks **✏ Edit** on account row.  
2. Modal opens with pre-filled metadata & automation configs.  
3. User edits metadata (Name, Status, Foto, Welcome, Position, Auto Move, Backup, Rotator).  
4. **Status Card** shows breakdown per connect/slot (Aktif, Disconnected, Tidak di set).  
5. If Account \= Tidak Aktif → popup **Hubungkan Akun WhatsApp** auto-opens → QR/Pairing auto-refresh → scan success updates slot to Aktif.  
6. User can click **Bagikan Link Publik** (per akun or per slot).  
7. Lifecycle Actions:  
   * **Simpan** → save changes, toast “Berhasil menyimpan perubahan”.  
   * **Log Out** → disconnect slot.  
   * **Putuskan & Hapus** → end sessions & delete account.

8. Navigation: **\< Sebelumnya / Berikutnya \>** for quick switch between accounts, with unsaved prompt if needed.

---

## **7 | Error Handling**

| Code | Scenario | UI Message |
| ----- | ----- | ----- |
| 400-WAE01 | Nama kosong | “Nama tidak boleh kosong” |
| 400-WAE02 | Invalid foto | “Format foto tidak valid (jpg/png ≤ 2MB)” |
| 400-WAE03 | Pesan pembuka invalid | “Pesan pembuka maksimal 512 karakter” |
| 400-WAE04 | Auto Move & Backup conflict | “Nomor backup tidak boleh Auto Move” |
| 403-WAE05 | Permission denied | “Akses ditolak” |
| 404-WAE06 | Account not found | “Akun tidak ditemukan” |
| 409-WAE07 | Data changed elsewhere | “Data telah diperbarui oleh pengguna lain. Muat ulang.” |
| 500-WAE08 | Server/connection error | “Gagal memuat status akun. Coba lagi.” |

---

## **8 | Future Considerations**

* Multi-account connect queue (scan sequentially across accounts).  
* Public link expiration management & revoke option.  
* Inline timeline of connect/disconnect history per slot.  
* Scheduled auto-delete for inactive accounts.

---

## **9 | Limitations**

| Limitation | Work-around |
| ----- | ----- |
| Public links expire after 10 min | Manual regenerate |
| Pairing Code limited to one device slot | Use QR for multi-device login |
| Welcome Message only for WA Business | Hidden otherwise |
| Phone Number immutable | Add new account if number changes |

