# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Billing Voucher Engine and Redemption Patch (Single-Step Apply, Eligibility, Discounts)  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-02-10 | Yusril Ibnu Maulana | Patch for prepaid billing for voucher engine configuration, eligibility rules, single-step redemption, invoice display, idempotency, and rounding. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Extend voucher engine to support configurable limits, eligibility rules, discount types, and single-step redemption while ensuring invoice correctness and auditability. |
| Scope | Patch updates voucher configuration rules, redemption UX, invoice discount line items, and edge case handling. |
| In Scope | Voucher effects: free months, token credit, discount base plan, discount addons. Discount modes: amount or percent with max cap. Validity period optional. Usage limits: global and per tenant, with unlimited flag. Eligibility: plan, base plan price, min purchase amount, subscription lifecycle scope, channel eligibility. Single-step apply with pre-apply benefit preview. Idempotency and double-submit protection. Invoice line item display for voucher discounts. |
| Out of Scope | Voucher creation UI and management UI for internal users. Tax handling and PPN details. Refund, rollback, revocation tools. Carry-over credit across months beyond defined duration rules. |

---

## **3\. Problem Statement**

| Problem | Impact |
| ----- | ----- |
| Voucher requirements are underspecified for discounts, addons, eligibility, and usage limits. | Risk of inconsistent billing outcomes and high support load. |
| Redemption flow uses 2-step confirm and can be prone to double-submit and concurrency errors. | Higher user friction and risk of duplicate application. |
| Voucher discount visibility on invoices needs standardization. | Lower trust and harder finance reconciliation. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Reduce redemption friction while preserving clarity of benefits. | \<= 1 primary apply action in redemption flow with clear benefit preview before applying. |
| Prevent billing errors and abuse. | 0 incidents of negative invoices and 0 duplicate voucher applications per tenant per code. |
| Improve auditability. | 100% voucher redemptions recorded in billing logs and reflected in invoice line items when impacting invoices. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-018 | P1 | As an Admin, I want to redeem a voucher code and see the benefits clearly before applying so that I can use promotions with confidence. | 1\. Given I open "Redeem voucher", When I input a valid code, Then the system shows a benefit summary in Bahasa Indonesia without applying it yet. 2\. Given the benefit summary is shown, When I click "Gunakan", Then the system applies the voucher in a single apply action and shows a success message in Bahasa Indonesia. 3\. Given the code is invalid or not eligible, When I input the code or click "Gunakan", Then the system shows an inline error in Bahasa Indonesia and applies no changes. 4\. Given I double-click "Gunakan" or refresh during submission, When the request repeats, Then the system applies the voucher at most once and returns a consistent outcome. |
| US-022 | P1 | As an Admin, I want voucher benefits to start from the current billing period so that promotions take effect immediately for this month. | 1\. Given the current billing period invoice is not paid, When I apply a voucher affecting subscription charges, Then the discount applies starting the current billing period. 2\. Given the current billing period invoice is already paid, When I apply a voucher affecting subscription charges, Then the discount starts on the next billing period and UI explains this in Bahasa Indonesia. 3\. Given the voucher grants token credit, When I apply it, Then tokens are credited immediately regardless of invoice status. |
| US-023 | P1 | As an Admin, I want vouchers to be restricted by plan, base plan price, and minimum purchase so that promotions target the right customers. | 1\. Given a voucher has eligible plan rules, When my current plan is not eligible, Then redemption is blocked with an eligibility message in Bahasa Indonesia. 2\. Given a voucher has eligible base plan price rules, When my base plan price does not match rules, Then redemption is blocked with an eligibility message in Bahasa Indonesia. 3\. Given a voucher has a minimum purchase amount, When my eligible subtotal is below the minimum, Then redemption is blocked with an eligibility message in Bahasa Indonesia. |
| US-024 | P1 | As an Admin, I want voucher usage limits enforced so that promotions cannot be abused. | 1\. Given a voucher has a global quota, When global quota is exhausted, Then redemption is blocked with an inline message in Bahasa Indonesia. 2\. Given a voucher has per-tenant usage limit, When my tenant has reached the limit, Then redemption is blocked with an inline message in Bahasa Indonesia. 3\. Given two admins redeem concurrently, When both submit "Gunakan", Then only one succeeds and the other gets a clear error in Bahasa Indonesia. |
| US-025 | P1 | As an Admin, I want voucher discounts shown on invoices so that finance can reconcile easily. | 1\. Given a voucher affects subscription charges, When an invoice is generated or updated for an affected period, Then invoice detail shows voucher discount line items under "Diskon voucher" with clear labeling in Bahasa Indonesia. 2\. Given a voucher affects addons and proration also exists, When invoice is displayed, Then voucher discounts and proration are shown as separate line items. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Voucher Engine Configuration | 1\. FR-034A: System MUST support voucher effects: free subscription months, token credit, discount on base plan price, discount on addons, or combination. 2\. FR-034B: System MUST support discount modes: flat amount in IDR or percentage. 3\. FR-034C: If discount mode is percentage, System MUST support max discount amount cap in IDR. 4\. FR-034D: System MUST support optional validity period using start date and end date, and MUST allow no expiry when both are empty. 5\. FR-034E: System MUST support global usage limit (total redemptions across all tenants) with an unlimited flag. 6\. FR-034F: System MUST support per-tenant usage limit (total redemptions per tenant) with an unlimited flag. 7\. FR-034G: System MUST support eligibility rules: eligible plan list, eligible base plan price rules, minimum eligible subtotal in IDR, eligible lifecycle scope, and eligible channel/addon scope. |
| Redemption and Application | 1\. FR-035A: System MUST allow Admin to redeem vouchers from billing UI with one apply action using "Gunakan". 2\. FR-035B: System MUST show a benefit preview in Bahasa Indonesia after a valid code is entered, without applying the voucher yet. 3\. FR-035C: System MUST apply voucher effects atomically on "Gunakan" and MUST record voucher usage in billing logs. 4\. FR-035D: System MUST be idempotent per tenant and voucher code for repeated submissions and network retries, and MUST not apply voucher more than once. 5\. FR-035E: System MUST block voucher stacking by default. Only 1 active voucher per tenant can be applied at a time. 6\. FR-035F: System MUST support case-insensitive voucher code matching and MUST trim whitespace before validation. |
| Benefit Start Rules | 1\. FR-037: Free months and subscription discounts MUST start from the current billing period if the current period invoice is not paid. 2\. FR-038: If the current billing period invoice is paid, subscription-related benefits MUST start from the next billing period. 3\. FR-039: Token credit MUST be applied immediately upon successful redemption. |
| Calculation Rules | 1\. FR-040: Discount eligibility base MUST be computed from eligible invoice components only: base plan and or addons as configured by voucher scope. 2\. FR-041: Invoice total MUST NOT become negative. If discount exceeds eligible amount, discount MUST be capped to eligible amount. 3\. FR-042: Percentage discount amount MUST be rounded down to IDR 1 granularity so the system is not less profitable by rounding. 4\. FR-043: Currency MUST be IDR only for voucher discounts and thresholds. |
| Eligibility Rules | 1\. FR-044: Voucher MUST support lifecycle eligibility scope: first activation, renewal, upgrade, reactivation. 2\. FR-045: If voucher is restricted to specific plans and tenant later upgrades or downgrades to a non-eligible plan, System MUST void remaining future-month subscription benefits for that voucher. 3\. FR-046: If voucher has eligible base plan price rules, System MUST validate against the tenant current base plan price used for billing. |
| Invoice Display | 1\. FR-047: Invoice detail MUST show voucher discounts under "Diskon voucher" grouping with clear labels and voucher code reference. 2\. FR-048: If proration exists in the same invoice, System MUST show voucher discount line items separately from proration line items. |
| Access Control | 1\. FR-049: System MUST restrict voucher redemption action to Admin role only. 2\. FR-050: Finance and Corporate Admin MAY view voucher impact on invoices and logs but MUST NOT be able to apply vouchers unless explicitly granted. |

---

## **7\. Error Handling**

| ID | Type | Condition | System Behavior | UI Message (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- | ----- |
| EH-012 | Voucher Invalid | Code does not exist. | Show inline error. Do not apply changes. | "Kode voucher tidak ditemukan. Silakan periksa kembali kode Anda." |
| EH-013 | Voucher Expired | Current date is after end date. | Show inline error. Do not apply changes. | "Masa berlaku voucher ini sudah berakhir dan tidak dapat digunakan." |
| EH-014 | Voucher Usage Limit | Global quota exhausted or per-tenant usage limit reached. | Show inline error. Do not apply changes. | "Voucher ini sudah digunakan sesuai batas pemakaian dan tidak dapat dipakai lagi." |
| EH-015 | Voucher Scope Mismatch | Plan, base price, min purchase, lifecycle scope, or channel scope not eligible. | Show inline error. Do not apply changes. | "Voucher ini tidak berlaku untuk paket atau akun Anda. Silakan gunakan voucher yang sesuai." |
| EH-023 | Voucher Stacking Not Allowed | Tenant already has an active voucher applied. | Block redemption. Show inline error. | "Voucher lain sedang aktif. Anda hanya dapat menggunakan 1 voucher dalam satu waktu." |
| EH-024 | Double Submit | User triggers multiple apply requests for the same code. | Apply at most once. Return consistent success or consistent prior error. | "Permintaan sedang diproses. Silakan tunggu." |
| EH-025 | Redemption Race | Two admins redeem the same code concurrently. | Only first succeeds. Second receives usage limit error. | "Voucher ini sudah digunakan sesuai batas pemakaian dan tidak dapat dipakai lagi." |
| EH-026 | Invoice Update Not Allowed | Current invoice is paid and voucher affects subscription charges. | Apply voucher but schedule subscription effect next period. Show info message in preview and after apply. | "Voucher berhasil diterapkan. Diskon paket akan mulai berlaku pada periode tagihan berikutnya karena invoice bulan ini sudah lunas." |

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | Related Requirements |
| ----- | ----- | ----- | ----- |
| EC-005 | Tenant has voucher providing free months and performs mid-cycle upgrades. | Base subscription for covered months is discounted by voucher. Addon proration remains normal unless voucher includes addons. Invoice shows voucher discounts and proration separately. | FR-040, FR-048 |
| EC-006 | Voucher provides both free months and free tokens. | Subscription charges are discounted per configured duration. Tokens are credited immediately. Both are logged and visible in billing dashboard and logs. | FR-039, FR-047 |
| EC-007 | Two admins attempt to redeem the same voucher concurrently. | Atomic validation ensures only one redemption succeeds. Second receives usage limit error. Logs capture tenant and user. | FR-035C, EH-025 |
| EC-017 | Voucher percent discount with max cap and eligible amount is low. | Discount is computed, capped by max cap, and also capped by eligible amount. Final discount is rounded down in IDR. | FR-041, FR-042 |
| EC-018 | Voucher restricted to plan and tenant changes to non-eligible plan after redemption. | Future-month subscription benefits are voided. Past applied discounts remain unchanged. UI does not retroactively adjust paid invoices. | FR-045 |
| EC-019 | Min purchase threshold depends on base plus addons, but voucher excludes addons. | Eligibility check uses only eligible components per voucher scope. | FR-040, FR-044 |
| EC-020 | Invoice already exists for current period but is unpaid. | Invoice is updated to include voucher discount line items. Total is recalculated and not negative. | FR-037, FR-041, FR-047 |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Billing Navigation | Entry point remains in Billing area. | 1\. Admin opens "Billing". 2\. Admin selects "Redeem voucher". | US-018 |
| Redeem Voucher Form | Input field and single apply action. | 1\. Show label "Kode voucher". 2\. Show primary button "Gunakan". 3\. Disable "Gunakan" only when input is empty. 4\. On click, show loading state on button. | US-018 |
| Benefit Preview Box | Shows benefits in Bahasa Indonesia prior to applying. | 1\. After valid code input, show summary box with benefit breakdown. 2\. If voucher impacts subscription and current invoice is paid, show info note that subscription discount starts next period. 3\. Summary remains visible until code changes or cleared. | US-018, US-022 |
| Success Feedback | Toast and page refresh behavior. | 1\. On success, show toast "Voucher berhasil diterapkan". 2\. Billing dashboard widgets refresh automatically. 3\. If token credited, token balance card refreshes. | US-018, US-022 |
| Inline Error States | Errors shown without navigation. | 1\. Show inline error under input when invalid or ineligible. 2\. Keep input value for correction. 3\. Do not show partial application state. | US-018, US-023, US-024 |
| Invoice Detail Display | Voucher discount visibility on invoice page. | 1\. In "Detail invoice", group includes "Diskon voucher". 2\. Each voucher discount line item shows clear label and code reference. | US-025 |

---

## **10\. Field & Validation**

| Field Name (UI Label in Bahasa Indonesia) | Context | Type | Example Value | Validation Rules | Required |
| ----- | ----- | ----- | ----- | ----- | ----- |
| "Kode voucher" | Redeem voucher | String | "FREE2MONTHS" | 1\. Trim leading and trailing whitespace. 2\. Case-insensitive matching. 3\. Alphanumeric only. 4\. Max length 32 characters. 5\. Validate existence. 6\. Validate validity period if configured. 7\. Validate global usage limit if configured. 8\. Validate per-tenant usage limit if configured. 9\. Validate stacking rule. 10\. Validate eligibility rules: plan, base plan price, min purchase, lifecycle scope, channel scope. | Yes |

---

## **11\. Non-Functional Requirements**

| ID | Category | Requirement |
| ----- | ----- | ----- |
| NFR-101 | Performance | Voucher validation response must be \<= 2 seconds P95. Voucher apply must be \<= 3 seconds P95. |
| NFR-102 | Reliability | Voucher redemption must be idempotent and safe for retries. No duplicate application per tenant per code. |
| NFR-103 | Security | Voucher redemption must follow billing access control. Only Admin can apply vouchers. |
| NFR-104 | Observability | Every redemption attempt must be logged with tenant, user, code, outcome, and correlation ID. |
| NFR-105 | Data Integrity | Invoice total must never become negative after applying voucher discounts. |

---

## **12\. Dependencies & Risks**

| ID | Type | Item | Description | Mitigation |
| ----- | ----- | ----- | ----- | ----- |
| DR-101 | Dependency | Invoice engine | Needs support for adding voucher discount line items and recalculating totals. | Add automated tests for invoice recalculation and non-negative constraints. |
| DR-102 | Dependency | Token ledger | Needs atomic token credit on redemption. | Ensure transactional behavior with idempotency keys. |
| DR-103 | Risk | Misconfigured eligibility rules | Could block valid customers or allow unintended customers. | Add strict validation for voucher configuration and clear logs for mismatch reasons. |
| DR-104 | Risk | Concurrency | Duplicate redemption under race conditions. | Enforce atomic redemption and consistent error mapping. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Voucher redemption success rate | \>= 98% for valid codes | 30 days | Billing logs |
| Duplicate redemption incidents | 0 | 30 days | Billing logs and alerts |
| Support tickets about voucher confusion | \-30% vs baseline | 60 days | Support tickets |

---

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Voucher stacking rules | Some enterprise promos may require stacking or priority ordering. |
| Voucher management UI | Self-serve promo management for internal ops and finance. |
| Multi-currency | Expansion beyond IDR. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No voucher stacking | Tenants cannot combine multiple promos. |
| No refunds or rollback | Mistaken applications require engineering intervention. |
| No tax handling in voucher scope | Tax computations are not part of this patch. |

