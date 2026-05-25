# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: WhatsApp Web Account Pools and Rotation (General Accounts, Auto-use Backups, Group Rotation, Outbound Limit)  
**Product Manager**: Yusril Ibnu  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

Prototype: [https://chatgpt.com/canvas/shared/697c6cccfd6881919cfac3571a1d25f4](https://chatgpt.com/canvas/shared/697c6cccfd6881919cfac3571a1d25f4) 

---

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v2.0 | 2025-10-09 | Yusril Ibnu | Baseline Account List with Account Groups and Reserved pool, manual swap, quota reminder. Auto-rotation was out of scope. |
| v3.0 | 2026-01-30 | Yusril Ibnu | Add General Accounts, Auto-use Backups, Group Rotation, and configurable Outbound Limit linked to Auto-use Backups. |

---

## **2\. Overview**

| Field | Description |
| ----- | ----- |
| Purpose | Make WhatsApp Web number usage resilient and simple for admins by introducing a shared pool (General Accounts), a backup pool, and optional auto failover. |
| Background | Current v2.0 supports Account Groups and a Reserved pool with manual replacement and quota reminder, with Auto-rotation out of scope. |
| Scope | WhatsApp Web settings page only (Account List), plus backend rotation logic that affects outbound sender selection. |
| Primary Users | Admin (configuration). Agents impacted indirectly via sender availability. |
| Assumptions | Anti-spam service provides recommended daily cap per number or tier. Team Inbox linking to a group is optional, unlinked routes to main inbox. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-1 | “Active vs backup” is unclear and requires manual work when a number is over quota or disconnected. | Slower recovery, downtime, operational confusion. |
| PS-2 | No “shared” pool for using any active number across teams without grouping. | Unused capacity while other numbers are idle. |
| PS-3 | Manual replacement is fragile under bursts and quota thresholds. | Missed outbound, agent interruptions. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Reduce operational friction | Auto failover from backup works with no more than 1 admin config toggle. |
| Keep behavior predictable | Group mode stays “consistent sender” (one “used” number per group) unless failover is required. |
| Prevent silent quota overuse | When Auto-use Backups is ON, exceeding outbound limit makes a number ineligible for selection and triggers fallback. |

---

## **5\. User Stories and Acceptance Criteria**

### **Admin**

| ID | Pri | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-1 | P0 | As an Admin, I view three tabs to manage numbers by intent: shared use, grouped use, and backup. | 1\. Given Account List page When loaded Then I see tabs labeled “Akun Umum”, “Akun Grup”, “Akun Cadangan”. 2\. Given each tab When opened Then each shows a table of accounts with consistent columns (number, name, status, outbound, actions). |
| US-2 | P0 | As an Admin, I enable or disable automatic backup usage globally. | 1\. Given Account List page header controls When I toggle “Pakai cadangan otomatis” ON Then system enables auto failover for both “Akun Umum” and “Akun Grup”. 2\. Given toggle is OFF When a number is over limit or disconnected Then system does not auto promote from “Akun Cadangan” and requires manual action. |
| US-3 | P0 | As an Admin, I set the global default outbound limit (only when auto backups are ON). | 1\. Given “Pakai cadangan otomatis” is ON When I click “Batas outbound default” settings Then I can set an integer limit and save. 2\. Given “Pakai cadangan otomatis” is OFF When I view header controls Then “Batas outbound default” is hidden. |
| US-4 | P0 | As an Admin, I set how many devices are active in “Akun Umum”. | 1\. Given “Akun Umum” tab When I click settings on “Set perangkat aktif” and save Then the system enforces active count and demotes overflow accounts to “Akun Cadangan”. 2\. Given active count increases and backups ON When there are eligible accounts in “Akun Cadangan” Then system promotes eligible backups until active count is satisfied. |
| US-5 | P0 | As an Admin, I manage “Akun Grup” with one “used” number and optional group rotation. | 1\. Given a group has multiple accounts When I click action “Jadikan dipakai” on an eligible account Then it becomes the only “Dipakai” and others are “Siaga”. 2\. Given group rotation is ON When the “Dipakai” account becomes ineligible Then system switches “Dipakai” to next eligible in the same group before using backup. |
| US-6 | P0 | As an Admin, I prevent moving an account that already exceeded its outbound threshold into active usage. | 1\. Given an account in “Akun Cadangan” with outbound sent \>= outbound limit When I move it into “Akun Umum” or into an “Akun Grup” Then system blocks and shows warning “Akun melewati batas outbound, naikkan batas atau gunakan akun lain”. |

### **Agent (indirect)**

| ID | Pri | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-7 | P1 | As an Agent, sender number is stable per conversation session. | 1\. Given a conversation session already used sender S When I send subsequent outbound messages in the same session Then system keeps sender S unless S becomes ineligible and failover occurs (if enabled). |

---

## **6\. Functional Requirements**

| ID | Requirement |
| ----- | ----- |
| FR-1 | **Containers and exclusivity**: Each WhatsApp account can belong to exactly one of: General Accounts, a specific Account Group, or Backup Accounts. |
| FR-2 | **General Accounts active set**: “Set perangkat aktif \= N” defines how many accounts are in the active General set. Overflow accounts are stored in Backup. |
| FR-3 | **Group consistency**: Each Account Group has exactly one “Dipakai” account at a time (consistent sender). Baseline behavior aligns with existing “In used” concept. |
| FR-4 | **Eligibility** (for selection or promotion) when Auto-use Backups is ON: account must be Connected, not Restricted, and outboundSent \< outboundLimit. |
| FR-5 | **Outbound limit sources**: 1\) per-account override if set, else 2\) global default outbound limit. Recommended cap from anti-spam remains displayed as reference (non-blocking) when Auto-use Backups is OFF. |
| FR-6 | **Auto-use Backups** (global): when ON, system auto demotes ineligible active accounts into Backup and promotes eligible Backup accounts to keep capacity. Applies to General and Groups. |
| FR-7 | **General failover behavior**: if an active General account becomes ineligible, it is demoted to Backup and replaced by an eligible Backup account until active count is met (best effort). |
| FR-8 | **Group rotation** (per group): when ON and current “Dipakai” becomes ineligible, the system selects the next eligible account in the same group as new “Dipakai”. If none, and Auto-use Backups ON, promote from Backup into the group and optionally set as “Dipakai”. |
| FR-9 | **Move constraints**: moving any account from Backup into General or Group is blocked if outboundSent \>= outboundLimit (when Auto-use Backups ON). Must show warning and offer direct action to edit limit. |
| FR-10 | **Manual replace is still supported**: Admin can still “Replace from reserved via swap” style action (now “Ganti dari cadangan”) similar to v2.0 manual swap. |

---

## **7\. Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| Performance | Search and filter results render in \<= 1s for typical tenants. Baseline expectation aligns with existing list UX. |
| Reliability | Rotation and promotion operations must be idempotent and safe under concurrency (double sends must not cause two “Dipakai” in a group). |
| Auditability | Log config changes: toggle Auto-use Backups, changes to default limit, changes to active devices, and “Jadikan dipakai” events. |
| Security | Admin-only access remains for configuration actions, consistent with v2.0 admin-only scope. |

---

## **8\. UI/UX Requirements (UI strings must be Bahasa Indonesia)**

### **Tabs and Global Controls**

* Tabs (left to right):  
  * “Akun Umum”  
  * “Akun Grup”  
  * “Akun Cadangan”  
* Top right controls (aligned with tabs area):  
  * “Pakai cadangan otomatis” (switch)  
  * “Batas outbound default” (settings button, only visible when switch is ON)

### **General Accounts tab**

* Header chip:  
  * “Set perangkat aktif: {N}” with settings icon  
* Table actions:  
  * “Ubah batas outbound” (enabled only if Auto-use Backups ON, else disabled with helper text)  
  * “Pindahkan ke cadangan”  
* Add button:  
  * “Tambah akun” (visible in this tab)

### **Group Accounts tab**

* Search, filter, and button aligned:  
  * Search input  
  * Filter (linked Team Inbox, status)  
  * Button “Buat grup”  
  * Button “Tambah akun”  
* Group row table:  
  * Primary action: “Jadikan dipakai”  
  * Group rotation toggle label: “Rotasi grup”  
  * Do not show duplicated explanatory labels (remove repeated “Auto-use backups: On” and verbose ineligible descriptions)

### **Backup Accounts tab**

* Table actions:  
  * “Pindahkan ke akun umum”  
  * “Pindahkan ke grup”  
  * Hide self-move options in menus (no “move to backup” inside backup, no “move to umum” inside umum)

### **Warning copy**

* When blocked move due to outbound threshold:  
  * “Akun melewati batas outbound. Naikkan batas outbound atau gunakan akun lain.”

---

## **9\. Data Model**

| Entity | Fields |
| ----- | ----- |
| WhatsAppAccount | id, phoneNumber, displayName, connectionStatus (Connected, Not connected, Restricted), outboundSentToday, outboundLimit (nullable), containerType (GENERAL, GROUP, BACKUP), containerId (nullable), updatedAt |
| AccountGroup | id, name, linkedTeamInboxId (nullable), usedAccountId (nullable), groupRotationEnabled (boolean) |
| TenantWhatsAppSettings | tenantId, autoUseBackupsEnabled (boolean), defaultOutboundLimit (int, nullable when autoUseBackupsEnabled is OFF), generalActiveDevices (int) |

---

## **10\. API Requirements (minimal)**

| Endpoint | Method | Purpose |
| ----- | ----- | ----- |
| /wa/settings | GET | Fetch tenant WhatsApp settings and lists for all tabs. |
| /wa/settings | PATCH | Update autoUseBackupsEnabled, defaultOutboundLimit, generalActiveDevices. |
| /wa/accounts/{id} | PATCH | Update outboundLimit override, move container, connect status simulation (internal/debug). |
| /wa/groups/{id} | PATCH | Update usedAccountId, groupRotationEnabled, linkedTeamInboxId. |

---

## **11\. Analytics and Success Metrics**

| Metric | Target | Notes |
| ----- | ----- | ----- |
| Auto failover success rate | \>= 95% | When Auto-use Backups ON and eligible backups exist. |
| Mean time to recovery (disconnect or over limit) | \<= 30s | Time until replacement selected and usable. |
| Admin actions per incident | \-50% | Reduce manual swap frequency compared to v2.0 baseline. |

---

## **12\. Dependencies**

| Dependency | Why |
| ----- | ----- |
| Anti-spam recommended caps | Used as reference and baseline cap behavior in v2.0. |
| Connection status pipeline | Eligibility depends on accurate Connected and Restricted status. |
| Team Inbox routing | Group linking behavior remains optional. |

---

## **13\. Risks and Edge Cases**

| Scenario | Expected Behavior |
| ----- | ----- |
| Backup pool empty | Auto-use Backups cannot promote. System keeps fewer active devices than target and surfaces admin warning in settings. |
| All accounts Restricted | No eligible selection. Block promotions and show warning. |
| Two admins changing “Jadikan dipakai” concurrently | Last write wins, but system must enforce exactly one usedAccountId per group atomically. |
| Outbound limit increased after block | Move action becomes allowed immediately after save. |
| Auto-use Backups OFF but outbound exceeds recommended cap | Show reminder only (non-blocking), consistent with v2.0. |
| Moving from group to backup when it is the used number | Require admin confirmation and auto clear usedAccountId, then select next used if rotation ON and eligible exist. |

---

## **14\. Out of Scope**

| Item | Reason |
| ----- | ----- |
| Per-number “simulation settings” and advanced analytics exports | Explicitly out of scope in v2.0, keep lean. |
| Automatic bidding of General Accounts to Team Inbox | Known limitation: General Accounts is shared, not inbox-specific. |
| Broadcast rotator controls | Not part of this settings. |

---

## **15\. Open Questions (kept minimal)**

| Question | Default Decision for v3.0 |
| ----- | ----- |
| What is the “main inbox” for General Accounts inbound routing | Route to main inbox (existing behavior for unlinked). |

---

## **16\. Appendix**

### **Terminology mapping (internal vs UI)**

| Concept | Internal name | UI label |
| ----- | ----- | ----- |
| Shared pool | General Accounts | “Akun Umum” |
| Grouped pool | Group Accounts | “Akun Grup” |
| Backup pool | Backup Accounts | “Akun Cadangan” |
| Auto failover | Auto-use backups | “Pakai cadangan otomatis” |
| Active capacity | Active devices | “Set perangkat aktif” |

