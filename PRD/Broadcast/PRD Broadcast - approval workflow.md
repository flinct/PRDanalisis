# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Broadcast Template Internal Approval Workflow (Google Chat)  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-14 | Yusril Ibnu Maulana | Initial draft for internal approval workflow. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a single internal approval workflow for broadcast templates before they become usable internally or before they are submitted to an external provider. |
| Scope | Internal request, approve, reject, cancel, audit trail, and Google Chat notification reliability with 3 delivery attempts. |

### **Scope**

| In Scope | Out of Scope |
| ----- | ----- |
| Internal approval request via Google Chat message with Approve and Reject actions. | Multi-step approvals. |
| Reject is final and forces create-new-template. | Re-submit the same rejected template. |
| Conditional provider handoff after internal approval. | Provider review UI. |
| Delivery retry policy for Google Chat notification. | Approvals via email or other chat apps. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Templates can proceed without internal governance. | Higher risk of policy violations and provider rejections. |
| PS-002 | Approval decisions are not traceable. | Low accountability and repeated mistakes. |
| PS-003 | Notification delivery can fail silently. | Approval requests become stuck without a clear recovery path. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Enforce governance | 100 percent of templates that require internal approval must be decided before becoming ready. |
| Improve reliability | At least 99 percent of approval requests reach approvers with the 3-attempt policy. |
| Reduce waste | Reduce provider submission failures caused by content issues by 20 percent versus baseline. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a Requester, I request for approval of a template so it can be decided by an approver. | 1\. Given I have permission template\_request\_approval, When I click **"Submit for review"**, Then system creates an approval request with status PENDING. 2\. Given the request is created, When the request is PENDING, Then the template is locked and cannot be edited. 3\. Given I do not have permission template\_request\_approval, When I try to access the request action, Then I see **"Ditolak"**. |
| US-002 | P0 | As an Approver, I approve a pending request from Google Chat so the template can proceed to the next step. | 1\. Given I have permission template\_approve, When I click **"Setujui"** from the Chat message, Then the decision is recorded as approved and the page shows **"Berhasil disetujui"**. 2\. Given the template requires provider submission, When I approve, Then system starts provider submission after internal approval is recorded. 3\. Given the template does not require provider submission, When I approve, Then the template becomes ready internally. |
| US-003 | P0 | As an Approver, I reject a pending request so the requester must create a new template. | 1\. Given I have permission template\_approve, When I click **"Tolak"**, Then the decision is recorded as rejected and the page shows **"Berhasil ditolak"**. 2\. Given a template is internally rejected, When a requester attempts to edit or request approval again, Then system blocks with **"Template sudah ditolak. Buat template baru."** |
| US-004 | P0 | As the System, I ensure Google Chat delivery is reliable. | 1\. Given the first send to Google Chat fails, When retry policy runs, Then system retries up to 3 total attempts. 2\. Given all 3 attempts fail, When the requester views the approval request status, Then system log. |
| US-006 | P1 | As an Approver, I do not accidentally change state by clicking twice. | 1\. Given a request is already decided, When I click any Chat action again, Then no state changes and the page shows **"Permintaan Approve / Reject sudah diproses"**. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Roles and Permissions | FR-001: System MUST define a Requester as any authenticated user who has permission template\_request\_approval. FR-002: System MUST define an Approver as any authenticated user who has permission template\_approve. FR-003: System MUST block all approval actions for users without required permissions and return **"Akses ditolak"**. |
| Approval Request Creation | FR-010: When a Requester clicks **"Ajukan persetujuan"**, system MUST create approval\_request with status PENDING. FR-011: System MUST store requested\_by and requested\_at at creation time. FR-012: System MUST lock the template when an approval request is PENDING. FR-013: System MUST prevent edits while locked and show **"Template sedang diproses."** on edit attempts. |
| Google Chat Notification | FR-020: System MUST send a Google Chat message for each new PENDING request to a configured Space. FR-021: The message MUST include template name, channels, a content preview snippet, requester name, and two actions **"Setujui"** and **"Tolak"**. FR-022: System MUST retry delivery up to 3 total attempts if send fails. FR-023: Retry schedule MUST be fixed: attempt 1 immediate, attempt 2 after 1 minute, attempt 3 after 5 minutes. FR-024: After 3 failed attempts, system MUST set notification\_status=FAILED and expose a requester action **"Kirim ulang"** that starts a new 3-attempt cycle. |
| Approve Decision | FR-030: When an Approver clicks **"Setujui"**, system MUST record decision with decided\_by, decided\_at, and set request status to APPROVED. FR-031: System MUST be idempotent. If request is not PENDING, system MUST not change state and must return an info page. FR-032: After internal approval is recorded, system MUST proceed to Step 2 if requires\_provider\_submission=true. FR-033: If requires\_provider\_submission=false, system MUST mark template as ready internally. |
| Reject Decision | FR-040: When an Approver clicks **"Tolak"**, system MUST record decision and set request status to REJECTED. FR-041: System MUST set template internal state to INTERNAL\_REJECTED and lock permanently. FR-042: System MUST block any further approval requests for the same template and show **"Template sudah ditolak. Buat template baru."** |
| Cancel Request | FR-050: Requester MUST be able to cancel only when request status is PENDING. FR-051: Cancel MUST set request status to CANCELED and unlock template for editing. |
| Action Result Pages | FR-060: Chat action links MUST open a web page that shows a single message only. FR-061: Approve success page copy MUST be **"Berhasil disetujui"**. FR-062: Reject success page copy MUST be **"Berhasil ditolak"**. FR-063: Already processed copy MUST be **"Permintaan sudah diproses"**. FR-064: Inactive copy MUST be **"Permintaan sudah tidak aktif"**. FR-065: Unauthorized copy MUST be **"Akses ditolak"**. |
| Audit and Traceability | FR-070: System MUST write an audit record on create, approve, reject, cancel, and resend. FR-071: Audit MUST include actor, timestamp, decision type, and request id. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI Copy (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission | Block request approval if user lacks permission. | "Akses ditolak" |
| EH-002 | Notification | If Google Chat send fails, retry up to 3 attempts. | "Sedang mengirim notifikasi" |
| EH-003 | Notification | After 3 failures, mark failed and allow resend. | "Notifikasi gagal dikirim. Kirim ulang." |
| EH-004 | Decision | If request already decided, return info page. | "Permintaan sudah diproses" |
| EH-005 | Decision | If request canceled or template deleted, return info page. | "Permintaan sudah tidak aktif" |
| EH-006 | Reject finality | Block edits and re-request on rejected template. | "Template sudah ditolak. Buat template baru." |

---

## **8\. Edge Cases**

| ID | Case | Handling |
| ----- | ----- | ----- |
| EC-001 | Approver clicks Approve twice | First click decides. Second click returns "Permintaan sudah diproses". |
| EC-002 | Requester cancels while approver opens Chat message | Any later action returns "Permintaan sudah tidak aktif". |
| EC-003 | Google Chat message delivered late after decision | Action remains idempotent and returns "Permintaan sudah diproses". |
| EC-004 | Resend triggered multiple times | Only one active send cycle at a time per request. Additional clicks return "Permintaan sudah diproses" for send cycle or are blocked. |
| EC-005 | Template deleted while pending | Decision endpoints return "Permintaan sudah tidak aktif". |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Request Approval Action | Provide a single action to request approval. | 1\. User opens template detail. 2\. User clicks "Ajukan persetujuan". 3\. System locks template and starts notification send. | US-001 |
| Cancel Request Action | Allow cancel only when pending. | 1\. User opens template detail. 2\. User clicks "Batalkan pengajuan". 3\. Template becomes editable. | US-005 |
| Resend Notification Action | Allow resend only when notification failed. | 1\. User sees status failed. 2\. User clicks "Kirim ulang". 3\. System runs 3-attempt delivery cycle. | US-004 |
| Approver Result Page | Minimal content page for approve outcome. | 1\. Approver clicks "Setujui". 2\. Page shows "Berhasil disetujui". | US-002 |
| Reject Result Page | Minimal content page for reject outcome. | 1\. Approver clicks "Tolak". 2\. Page shows "Berhasil ditolak". | US-003 |
| Info Result Pages | Minimal pages for no-op outcomes. | 1\. Approver clicks old link. 2\. Page shows "Permintaan sudah diproses" or "Permintaan sudah tidak aktif". | US-006, US-005 |

---

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| approval\_request\_id | UUID | apr\_01... | Server assigned | Server |
| template\_id | UUID | tpl\_01... | Must exist in tenant | Yes |
| status | Enum | PENDING | One of PENDING, APPROVED, REJECTED, CANCELED | Yes |
| requested\_by | UserId | usr\_123 | Must be authenticated | Yes |
| requested\_at | Timestamp | ISO8601 | Server time | Yes |
| decided\_by | UserId | usr\_456 | Must have permission template\_approve | Conditional |
| decided\_at | Timestamp | ISO8601 | Server time | Conditional |
| notification\_status | Enum | SENT | One of PENDING, SENT, FAILED | Yes |
| notification\_attempts | Integer | 2 | Range 0 to 3 per send cycle | Yes |
| requires\_provider\_submission | Boolean | true | Derived from channel config | Yes |
| internal\_state | Enum | INTERNAL\_PENDING | Must match request status rules | Yes |

---

## **11\. Non-Functional Requirements**

| Category | Target |
| ----- | ----- |
| Performance | Approve and reject decision page loads within 2 seconds at p95. |
| Availability | 99.9 percent monthly for approval decision endpoints. |
| Security | Tenant isolation. Authentication required for all actions. Permission checks enforced. |
| Privacy | Audit logs exclude template content body. Store only template id and decision metadata. |
| Accessibility | Action pages are readable with screen readers and have correct focus order. |

---

## **12\. Dependencies & Risks**

| Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Google Chat delivery reliability | Engineering | Requests may not reach approvers | 3-attempt retry plus resend action plus audit alert on failure. |
| Permission configuration | Product, Engineering | Unauthorized approvals | Default deny. Central permission checks. Audit all attempts. |
| Provider submission stability | Engineering | Internal approved but provider step fails | Keep internal approved. Track provider failure separately. Enable provider retry. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Chat delivery success | 99 percent | 30 days | Notification logs |
| Decision median time | 30 minutes | 30 days | approval\_request timestamps |
| Reject rate after internal | Baseline established | 30 days | approval\_request outcomes |
| Provider submission issues after internal approval | Down 20 percent | 60 days | Provider submission logs |

---

## **14\. Future Considerations**

| Topic | Why |
| ----- | ----- |
| Extend workflow to more channels | Same internal governance for Telegram, Email, Instagram, Facebook, and others. |
| Rejection reason | Faster learning loop for requesters. |
| Multi-approver | Larger tenants require stricter governance. |
| Escalation | Prevent pending requests from stalling. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Reject is final | Requesters must create a new template. |
| Single-step approval | Cannot model complex org compliance needs. |
| Google Chat only | No alternative approval channel in MVP. |

---

## **16\. Appendix**

| Item | Definition |
| ----- | ----- |
| Requester | Any authenticated user with permission template\_request\_approval. |
| Approver | Any authenticated user with permission template\_approve. |
| Step 1 | Internal approval decision lifecycle. |
| Step 2 | Provider submission lifecycle, only if configured as required. |

### Google Chat — Example Notification

**Title:** Approval needed: Broadcast Template

**Content:**

Template: promo\_launch\_jan  
Channels: WhatsApp Web, WhatsApp Official  
Category: Marketing *(optional)*  
Requested by: Dina  
Requested at: 2026-01-14 14:22 WIB  
Variables: {{first\_name}}, {{order\_id}} *(optional)*

**Template (wrapped code)**

Hi {{first\_name}}, pesanan {{order\_id}} sudah siap dikirim. Balas YA untuk konfirmasi.

**Actions**

* ✅ **Approve** → .../approval/act?rid=...\&action=approve\&token=...  
* ❌ **Reject** → .../approval/act?rid=...\&action=reject\&token=....

