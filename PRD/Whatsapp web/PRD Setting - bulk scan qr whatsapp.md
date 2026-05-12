# **Product Requirement Document (PRD)**

**Feature:** Popup Bulk Scan QR/Pairing for Inactive WhatsApp Accounts  
**Author** : Yusril Ibnu Maulana  
**Product Manager**: Aryo  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Provide a dedicated **bulk scan popup** for WhatsApp accounts that are in **Inactive** status, allowing Admin/Supervisor to quickly activate multiple accounts via QR scan or Pairing Code without re-entering account data. |
| **Key Capabilities** | Triggered from Account List filter (Inactive only), supports QR or Pairing Code (switchable), bulk scanning flow with queue/next/previous navigation, auto-refresh QR/Pairing Code, public link sharing per slot, real-time update of account status once connected. |
| **Outcome** | Faster onboarding for multiple inactive accounts, simplified flow for mass scanning, less manual work, and consistent activation experience across accounts. |

---

## **2 | Problem Statement**

| \# | Problem Description |
| ----- | ----- |
| 1 | Currently inactive accounts must be activated one by one, inefficient for bulk setups. |
| 2 | No dedicated popup/flow for scanning only inactive accounts. |
| 3 | No bulk navigation (next/previous) to move between inactive accounts in one session. |

---

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Simplify bulk scanning of inactive accounts | ≥ 80% of inactive accounts activated in one session. |
| Provide flexible connection methods | Both QR & Pairing Code available and switchable. |
| Reduce scanning time | Avg. time per account ≤ 1 minute. |

---

## **4 | User Stories & Acceptance Criteria**

| Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| **P0** | As an Admin, I want to open a popup that lists only inactive accounts. | – Popup shows table/list of inactive accounts (Name, Number, Team Inbox, Status). – Bulk select or “Scan All” option available. |
| **P0** | As an Admin, I want to choose QR or Pairing Code as connection method. | – Toggle switch **“Metode Koneksi: QR / Pairing Code”** at top. – Default \= QR. – Switching updates all slots accordingly. |
| **P0** | As an Admin, I want to scan accounts one by one with next/previous navigation. | – Account detail view with QR/Pairing Code shown. – Buttons **“\< Sebelumnya”** and **“Berikutnya \>”** navigate between inactive accounts. – Unsaved/unfinished scans prompt confirmation. |
| **P0** | As an Admin, I want to auto-refresh QR/Pairing Code while scanning. | – Code auto-refreshes every 30s while popup active. – Refresh timer visible. |
| **P0** | As an Admin, I want to bulk scan all inactive accounts. | – Button **“Bulk Scan Semua Akun Inactive”**. – System enters sequential queue → after scan success, auto-next to next account. |
| **P1** | As an Admin, I want to share QR/Pairing Code externally for help scanning. | – Button **“Bagikan Link Publik”** per account. – Generates temporary link (expire 10 min) for that account’s QR/Pairing Code. |
| **P1** | As an Admin, I want to see real-time status updates. | – After scan success, account status updates to **Active** in both popup & main list. |

---

## **5 | Field-Level Details & Validation**

| Field | Type | Rules | Example |
| ----- | ----- | ----- | ----- |
| Account Name | String | Pre-filled | “WA Bandung” |
| Phone Number | String | Pre-filled, read-only | \+628123456789 |
| Team Inbox Auto Move | Enum | Pre-filled if set, else “No Team Inbox” | Inbox-CS |
| Status | Enum | Inactive → Active after scan | Inactive → Active |
| Connection Method | Enum | QR / Pairing Code | QR |
| Public Link | URL | Expire in 10 min | https://wa.satuinbox.com/link123 |

---

## **6 | UX Flow**

1. User opens **WhatsApp Account List** → filter **Inactive**.  
2. Click button **“Bulk Scan Akun Inactive”**.  
3. Popup opens with:  
   * Top bar: toggle **Metode Koneksi: QR / Pairing Code**.  
   * Bulk action: **Scan Semua**.  
   * List of inactive accounts (Name, Number, Team Inbox).

4. User selects one account → detail panel shows QR/Pairing Code with auto-refresh.  
5. User scans → if success → status updates to Active, auto-next to next account.  
6. Navigation buttons **\< Sebelumnya / Berikutnya \>** to move manually.  
7. Option to click **Bagikan Link Publik** to generate shareable link for external scanning.  
8. When all selected accounts scanned → popup closes automatically or user clicks **Selesai**.

---

## **7 | Error Handling**

| Code | Scenario | UI Message |
| ----- | ----- | ----- |
| 400-WAP01 | No inactive accounts available | “Tidak ada akun inactive untuk discan.” |
| 400-WAP02 | Invalid connection method | “Metode koneksi tidak valid.” |
| 404-WAP03 | Account not found | “Akun tidak ditemukan.” |
| 409-WAP04 | Account already active | “Akun sudah aktif.” |
| 500-WAP05 | Failed to generate QR/Pairing | “Gagal membuat kode koneksi. Coba lagi.” |

---

## **8 | Future Considerations**

* Bulk “Skip” option (lewati akun yang bermasalah, lanjut ke berikutnya).  
* Multi-device slot scanning directly from bulk popup.  
* Progress bar (%) for bulk scan completion.  
* Integration with mobile app for scanning with device camera directly.

---

## **9 | Limitations**

| Limitation | Work-around |
| ----- | ----- |
| Pairing Code limited to one slot per account | Use QR for multi-device slots. |
| Public links expire after 10 min | Regenerate as needed. |
| Popup works only for Inactive accounts | Use Add Account flow for new entries. |

