# **Product Requirement Document (PRD)**

**Feature**: Prepaid Billing and Subscription System  
**Product Owner**: Aryo  
**Author**: Yusril Ibnu  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v0.1 | 2025-12-08 | Yusril | Init PRD |

---

## **2\. Overview**

### **2.1 Summary**

| Item | Description |
| ----- | ----- |
| Purpose | Define a hybrid pricing system where tenants pay a monthly subscription (plan \+ addons) and use prepaid tokens for broadcast messages, with upfront payment at onboarding and accurate proration for mid-cycle upgrades. |
| Scope | Onboarding billing, plan and addon lifecycle (upgrade/downgrade), prepaid token lifecycle, broadcast costing across channels (WhatsApp API, WhatsApp Web, Telegram, Facebook, Email), billing cycle rules, vouchers, and usage tracking. |
| Outcome | Predictable, scalable, and configurable pricing that protects revenue (no negative balances), keeps core inbox active when tokens run out, and exposes clear billing and usage information via dashboards, invoices, and reports. |

### **2.2 Scope**

| In Scope | Out of Scope |
| ----- | ----- |
| Monthly plan and addon billing with proration for upgrades and scheduled downgrades. | Detailed accounting, journal postings, and ERP integrations. |
| Prepaid token model for broadcasts and per-channel pricing (Meta-based for WhatsApp API and fixed pricing for WhatsApp Web / other channels). | Implementation details of Meta pricing fetch and caching (covered in technical design). |
| Billing dashboards, invoice list and detail, usage analytics, and usage reports export. | In-depth revenue analytics and forecasting models. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Current pricing does not separate fixed monthly subscription (plans/addons) from variable broadcast usage, and does not handle proration cleanly for mid-cycle changes. | Hard to charge fairly, leading to revenue leakage or manual corrections. |
| PS-002 | Broadcast pricing does not differentiate between WhatsApp API (Meta-based), WhatsApp Web, and other channels, nor handle resend pricing per channel. | Inaccurate costing, difficulty to align with Meta prices, and inconsistent margins. |
| PS-003 | Billing information (token usage, top up history, broadcast charges, proration) is not transparent to tenants. | Confusion, support load, and low trust in invoices. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Introduce a clean hybrid billing model with correct proration. | 90% of new tenants complete onboarding with plan, addons, and initial tokens fully paid before activation, and 0 manual proration corrections per month. |
| Ensure accurate and transparent broadcast costing by channel. | 100% of broadcast charges match defined pricing rules (including Meta-based WhatsApp API and WhatsApp Web pricing) with no negative token balances. |
| Improve billing transparency for admins and finance. | At least 80% of admins report that billing and usage dashboards are clear (via CSAT) and billing-related tickets stay below 5% of total tickets. |

---

## **5\. User Stories and Acceptance Criteria**

### **5.1 Admin / Owner – Onboarding and Initial Payment**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want a guided onboarding flow to choose a plan, addons, and initial tokens so that I see my total upfront payment and recurring monthly fees before activation. | 1\. Given I am a new tenant entering onboarding, When I start the wizard, Then I see sequential steps for "Pilih paket", "Pilih addon", "Top up token awal", and "Ringkasan & pembayaran" with labels in Bahasa Indonesia. 2\. Given I complete all configuration steps, When I reach the summary step, Then I see a breakdown table with line items "Biaya paket bulanan", each addon type (channels, agents, data retention), and "Top up token awal", with totals labeled in Bahasa Indonesia. |
| US-002 | P0 | As an Admin, **I want to select a subscription plan and immediately see default limits and included features** so that I can choose the appropriate tier. | 1\. Given I am on the "Pilih paket" step, When I click a plan card (for example "Paket Individual", "Paket Enterprise"), Then the card shows base price per month, default data retention (for example "Retensi data gratis 2 bulan"), and limit summary in Bahasa Indonesia. 2\. Given I have selected a plan, When I click "Lanjut" in Bahasa Indonesia, Then the selection is saved and used to calculate all subsequent pricing and limits. |
| US-003 | P0 | As an Admin, I want to configure channel, agent, and data retention addons during onboarding so that I only pay for what I need. | 1\. Given I am on the "Pilih addon" step, When I set the numbers for WhatsApp API, WhatsApp Web (if applicable), Instagram, Facebook, Telegram, Email accounts, and agent count, Then the UI immediately recalculates monthly addon totals using prices defined for my plan tier in the pricing appendix and displays them in Bahasa Indonesia. 2\. Given I select a data retention option ("Tanpa addon", "+20GB", "+100GB"), When I switch between options, Then the UI shows the incremental monthly fee (from the appendix) and a short description in Bahasa Indonesia of the retention behavior. |
| US-004 | P0 | As an Admin, I want to choose an initial token top up amount during onboarding so that I can start sending broadcasts immediately after activation. | 1\. Given I am on the "Top up token awal" step, When I enter a numeric amount, Then the UI shows "Token yang didapat: {amount}" and enforces a minimum of Rp 100.000 in Bahasa Indonesia. 2\. Given the amount is below the minimum or invalid, When I click "Lanjut", Then the system blocks progression, highlights the field, and shows an inline error message in Bahasa Indonesia explaining the minimum. |
| US-005 | P0 | As an Admin, **I want to pay the first invoice (plan \+ addons \+ initial tokens) and have my account activated only after payment is confirmed.** | 1\. Given I am on the "Ringkasan & pembayaran" step, When I click "Bayar sekarang", Then I am redirected or shown a payment interface (Apibayar) summarizing the invoice in Bahasa Indonesia. 2\. Given payment is confirmed, When I return to Satuinbox, Then tenant status changes to active, all configured plan and addons are active, tokens are credited, and a success message "Pembayaran berhasil, akun Anda sudah aktif." is shown in Bahasa Indonesia. |

### **5.2 Admin / Owner – Plan and Addon Lifecycle with Proration**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-006 | P0 | As an Admin, I want to upgrade addons (more agents, more channel accounts, higher data retention) in the middle of the month and be charged prorated for the remaining days so that I only pay for what I use. | 1\. Given I am on the addon management page and the current billing period runs from the 1st to the last day of the month, When I increase the number of agents or channel accounts or move to a higher data retention option effective today, Then the system calculates an additional prorated charge using the formula (Days remaining / Total days in month) × Monthly price and shows this explanation on the confirmation screen in Bahasa Indonesia. 2\. Given the upgrade is saved, When the next invoice is generated, Then the invoice includes a prorated line item for the upgrade with a clear "Prorata" label and the formula breakdown in Bahasa Indonesia. |
| US-007 | P0 | As an Admin, I want to request addon downgrades (fewer agents, fewer channel accounts, lower data retention) but have them only take effect at the start of the next billing cycle so that billing remains stable within the current month. | 1\. Given I am on the addon management page, When I decrease agent count, channel account counts, or select a lower data retention option, Then the system shows that the change will be effective on the 1st of the next month and keeps current usage unchanged for the remainder of this month in Bahasa Indonesia. 2\. Given the scheduled downgrade is saved, When the next billing period starts, Then the new lower addon levels and prices are applied to the new invoice without mid-cycle credits in the current month. |
| US-008 | P0 | As an Admin, I want to upgrade my plan tier (for example from Individual to Enterprise) mid-cycle with proration and immediate access to new limits and features. | 1\. Given I am on the plan management page, When I upgrade to a higher tier plan effective today, Then the system calculates additional prorated plan charges using (Days remaining / Total days) × (New monthly price \- Old monthly price) and shows the calculation in Bahasa Indonesia before confirmation. 2\. Given the upgrade is confirmed, When I use Satuinbox afterwards, Then new plan limits and pricing rules are active immediately and the next invoice shows the prorated plan upgrade line item. |
| US-009 | P0 | As an Admin, I want to request a plan tier downgrade but have it apply only after the current billing period finishes so that my current plan remains stable until month-end. | 1\. Given I am on the plan management page, When I choose a lower tier plan, Then the system shows that the downgrade will take effect from the 1st of the next billing month and keeps current tier benefits until the end of this month, in Bahasa Indonesia. 2\. Given the downgrade request is saved, When the next billing period starts, Then the new plan tier and prices are used for all calculations and shown on the next invoice. |

### **5.3 Admin / Owner – Tokens, Broadcast Pricing, and Logs**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-010 | P0 | As an Admin, I want to top up tokens at any time and see a history of my top up transactions so that I can manage broadcast budget. | 1\. Given I am on the billing dashboard, When I click "Top up token", Then a modal opens allowing me to input a top up amount (with minimum Rp 100.000) and select payment method, and after successful payment my token balance increases by the same amount in tokens and a record appears in "Riwayat top up" with date, amount, method, and status in Bahasa Indonesia. 2\. Given I have previous top ups, When I open the "Riwayat top up" section, Then I see a chronological list of top up transactions with filters (date range, status) and export option, all labeled in Bahasa Indonesia. |
| US-011 | P0 | As an Admin, I want broadcast token costs to be calculated per delivered message based on channel and category so that my charges are accurate and aligned with pricing rules. | 1\. Given I configure a broadcast using WhatsApp Web (Baileys), When I view the cost summary, Then first sends per unique recipient use the configured first-broadcast price (for example Rp 100 per message) and resends use the second+ broadcast price (for example Rp 75 per message) from the pricing appendix. 2\. Given I configure a broadcast using WhatsApp API (Official) with category Marketing, Utility, or Authentication, When I view the cost summary, Then each message uses the Meta base price for that category (for example Rp 586.33 for Marketing, Rp 356.65 for Utility/Authentication) plus 0.5% markup and the total is converted to tokens, with category and calculation shown in Bahasa Indonesia. |
| US-012 | P0 | As an Admin, I want tokens to be deducted only for successfully delivered broadcast messages, and to see a detailed broadcast charge log, so that I can audit costs. | 1\. Given a broadcast is executed, When messages are sent, Then the system deducts tokens only for messages that are marked as successfully sent/delivered by the channel provider, and total tokens deducted equal the sum of per-message prices from the pricing rules. 2\. Given a broadcast has completed, When I open its detail page, Then I can see a "Rincian biaya" section in Bahasa Indonesia showing per-channel category, number of delivered messages, price per message, and total tokens deducted, and a link to the global "Log penggunaan token". |
| US-013 | P0 | As an Admin, I want broadcasts to be blocked when token balance is not enough to cover the estimated cost so that my balance never goes negative. | 1\. Given my token balance is lower than the estimated total cost of a broadcast, When I try to send or schedule that broadcast, Then the system blocks the action, keeps the current configuration, and shows an inline error message in Bahasa Indonesia offering a shortcut to "Top up token". 2\. Given my token balance is zero, When I open the broadcast module, Then I see a banner "Broadcast sementara dinonaktifkan karena saldo token 0." and all send/schedule buttons are disabled until new tokens are added. |
| US-014 | P1 | As an Admin, I want to receive a low-credit reminder when my token balance approaches a configured threshold so that I have time to top up before broadcasts fail. | 1\. Given a global default low-credit threshold (initially 100.000 tokens) is configured by superadmin, When my balance falls below this threshold, Then the system sends an email to the billing email address with subject and body in Bahasa Indonesia explaining current balance and a suggestion to top up. 2\. Given in the future per-tenant thresholds can be configured, When a custom threshold is active, Then reminders use the tenant-specific value instead of the global default. |

### **5.4 Admin / Finance – Billing Cycle, Invoices, Proration Explainer, and Vouchers**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-015 | P0 | As an Admin, I want billing to follow a fixed monthly cycle (1st to last day) with automated invoice generation so that I have predictable billing dates. | 1\. Given my tenant is active, When a calendar month ends, Then at 00:00 WIB on the 1st of the following month the system automatically generates an invoice covering usage from the 1st to the last day of the previous month. 2\. Given invoices are generated, When the time reaches 09:00 WIB on the same day, Then the system sends invoice emails with PDF attachments to the billing email address in Bahasa Indonesia. |
| US-016 | P0 | As a Finance user, I want invoices to show prorated charges clearly with formula and tax so that I can verify charges quickly. | 1\. Given an invoice contains prorated items (from mid-cycle upgrades or first partial month), When I view the invoice detail page, Then each prorated line item includes a text explainer in Bahasa Indonesia showing the formula "(Hari aktif / Jumlah hari dalam bulan) × Harga bulanan" and the number of days used, unit price, and subtotal. 2\. Given the invoice is generated, When I view the totals, Then I see subtotal, PPN 11%, and grand total, and the invoice number follows the format "INV-YYYYMM-XXXXX" with due date 14 days from invoice date. |
| US-017 | P1 | As an Admin, I want a billing dashboard with invoice list and invoice detail so that I can monitor current charges, status, and history. | 1\. Given I have invoices, When I open the billing dashboard, Then I see a "Daftar invoice" table with invoice number, billing period, status, total amount, and due date, all labeled in Bahasa Indonesia, and I can click into each invoice to see details. 2\. Given I am viewing an invoice detail, When I click "Unduh PDF", Then a PDF with company branding and the same line items is generated and downloaded, and a success toast in Bahasa Indonesia is shown. |
| US-018 | P1 | As an Admin, I want to redeem voucher codes for free months and/or free token amounts so that I can use promotions easily. | 1\. Given I have a valid voucher code, When I open the "Redeem voucher" section in billing and input the code, Then the system validates the code and displays what it covers (for example "Gratis 2 bulan biaya paket" or "Bonus 100.000 token") in Bahasa Indonesia before applying it. 2\. Given the voucher type is configurable (free months, free tokens, or both), When the voucher is applied, Then the system adjusts future invoices and/or token balance accordingly, and shows a confirmation message in Bahasa Indonesia summarizing the benefit and validity period. |

### **5.5 Corporate Admin – Usage Analytics and Reports**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-019 | P1 | As a Corporate Admin, I want a usage analytics dashboard so that I can monitor current month charges, user and channel usage, and estimated end-of-month invoice. | 1\. Given I have access to billing analytics, When I open the "Usage analytics" dashboard, Then I see widgets for current month charges to date, active user/agent count and changes, storage usage in GB with trend, and outbound message counts by channel, all labeled in Bahasa Indonesia. 2\. Given the dashboard shows estimates, When I view the "Perkiraan tagihan akhir bulan" widget, Then it uses current usage and prices to compute a projected invoice total and displays that it is an estimate in Bahasa Indonesia. |
| US-020 | P1 | As a Corporate Admin, I want to download detailed usage reports so that I can perform internal cost allocation. | 1\. Given I am on the "Laporan penggunaan" page, When I set filters (date range, user/agent, channel, department if configured) and click "Generate laporan", Then the system generates a detailed usage report showing charges by dimension in Bahasa Indonesia. 2\. Given a report is generated, When I choose an export format (Excel, CSV, PDF) and click "Unduh", Then the corresponding file is generated and downloaded, and I can optionally schedule the same report to be delivered by email on a recurring basis. |

### **5.6 Admin / Owner – Package Detail and Live Usage**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-021 | P1 | As an Admin, I want the package detail page to show how many agents, channels, and broadcasts are actively used so that I can quickly see utilization against limits. | 1\. Given I open the "Detail paket" or "Paket berlangganan" page, When it loads, Then I see counts such as "Agent aktif", "Broadcast terkirim bulan ini per channel (WhatsApp API, WhatsApp Web, Instagram, Facebook, Telegram, Email)", and "Akun channel aktif per jenis" in Bahasa Indonesia, alongside my plan limits or "Unlimited". 2\. Given usage changes (for example more broadcasts sent or channel accounts added), When I refresh the page, Then the counts update to reflect the latest data. |

### **5.7 Agent – Broadcast Access vs Core Inbox**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-022 | P0 | As an Agent, I want to know when broadcast is disabled due to billing or tokens so that I do not waste time preparing campaigns that cannot be sent. | 1\. Given broadcast is disabled for the tenant due to insufficient tokens or unpaid invoice, When I open the broadcast module as an Agent, Then I see a banner in Bahasa Indonesia explaining that broadcast is currently disabled and that I should contact the Admin. 2\. Given broadcast later becomes enabled after Admin resolves billing or tops up tokens, When I refresh or reopen the broadcast module, Then the banner disappears and broadcast creation/sending becomes available according to my permissions. |
| US-023 | P0 | As an Agent, I want to keep using the inbox even when broadcasts are blocked so that I can continue serving customers. | 1\. Given the tenant has zero tokens or a billing issue but subscription is still active, When I open the inbox and handle conversations, Then all normal messaging and ticketing actions function without broadcast-related errors. 2\. Given broadcast is blocked, When I try to access broadcast-only actions from within a conversation, Then those actions are disabled or show a clear message in Bahasa Indonesia, but the rest of the conversation UI remains usable. |

---

## **6\. Functional Requirements**

| ID | Category | Requirement |
| ----- | ----- | ----- |
| FR-001 | Plan Model | System MUST support multiple plan tiers (for example Individual, Enterprise), each with configurable base monthly price, default data retention, limits (agents, channel accounts per type, monthly broadcast volume), and pricing mappings to addons and broadcast rules. |
| FR-002 | Onboarding Flow | System MUST provide a multi-step onboarding wizard for new tenants including: plan selection, addon configuration (channels, agents, retention), initial token top up, and payment summary before activation. |
| FR-003 | Activation | System MUST keep new tenants in an inactive state until the first invoice (plan \+ addons \+ initial tokens) is paid in full, and MUST prevent use of inbox and broadcast features before activation. |
| FR-004 | Channel Addons | System MUST allow Admins to configure the number of accounts for each supported channel type (WhatsApp API, WhatsApp Web if exposed separately, Instagram, Facebook, Telegram, Email) and MUST calculate monthly channel addon fees by multiplying these counts with per-tier per-channel prices defined in the pricing matrix. |
| FR-005 | Agent Addons | System MUST allow Admins to configure the number of agent seats and MUST calculate monthly agent addon fees using per-tier per-agent prices from the pricing matrix. |
| FR-006 | Data Retention Options | System MUST allow Admins to select one of the data retention options: default plan retention (no addon), 20GB addon, 100GB addon, and MUST calculate incremental monthly charges as defined per tier in the pricing matrix. |
| FR-007 | Billing Cycle | System MUST use a fixed monthly billing period from the 1st to the last day of each calendar month for all tenants and MUST not allow tenants to change the billing day. |
| FR-008 | Invoice Generation | System MUST automatically generate invoices at 00:00 WIB on the 1st of the month for the previous billing period, apply PPN 11% on taxable subtotal, compute grand total, assign invoice numbers using the format "INV-YYYYMM-XXXXX", and set due date to 14 days from invoice date. |
| FR-009 | Invoice Delivery | System MUST send invoice emails with attached PDF to the configured billing email address by 09:00 WIB on invoice generation day. |
| FR-010 | Proration Formula | For any mid-cycle upgrade (plan or addon) and for the first partial month when a tenant starts after the 1st, System MUST calculate prorated charges using the formula: (Days active or remaining in the period / Total days in month) × Monthly price. |
| FR-011 | Proration Explanation | System MUST display the proration formula and parameters (days counted, total days, unit price) on invoice line items that are prorated, with clear labels and descriptions in Bahasa Indonesia. |
| FR-012 | Upgrade Behavior | For mid-cycle upgrades of plan tier or addons, System MUST apply the new configuration immediately for usage and limits, and MUST add prorated charges for the remaining days of the current billing period to the next invoice or current invoice as defined in billing rules. |
| FR-013 | Downgrade Behavior | For plan tier and addon downgrades, System MUST schedule the change to take effect at the start of the next billing period (1st) and MUST not reduce current charges or limits within the ongoing period. |
| FR-014 | Token Model | System MUST maintain a token balance per tenant as an integer value where 1 token is equivalent to Rp 1 of broadcast budget; token balance MUST never be allowed to go below zero. |
| FR-015 | Token Top Up | System MUST allow Admins to top up tokens at any time with a configurable minimum amount (initially Rp 100.000) and MUST increase the token balance by the exact amount paid (after any applicable fees) using a 1:1 mapping. |
| FR-016 | Top Up History | System MUST record each token top up as a transaction with timestamp, amount in Rupiah, tokens credited, payment method, reference, and status, and MUST expose this history in a "Riwayat top up" view with filtering and export capabilities. |
| FR-017 | Broadcast Pricing \- WhatsApp Web | For WhatsApp Web (Baileys) broadcasts, System MUST use a per-message price for first broadcasts (for example Rp 100/message) and a lower or equal per-message price for second and subsequent broadcasts (for example Rp 75/message) to the same recipient within the same campaign, as defined in the pricing matrix. |
| FR-018 | Broadcast Pricing \- WhatsApp API | For WhatsApp API (Official) broadcasts, System MUST price messages per Meta category: Marketing, Utility, Authentication, using the Meta base prices (for example Rp 586.33 for Marketing, Rp 356.65 for Utility/Auth) plus a 0.5% markup, then convert the resulting Rupiah value to tokens per message. |
| FR-019 | Broadcast Pricing \- Other Channels | For Telegram, Facebook, and Email broadcasts, System MUST apply a per-message price defined per channel and plan tier (initially Rp 100/message) and MUST allow these values to be changed via configuration. |
| FR-020 | Category Handling | System MUST require a WhatsApp API broadcast to specify a Meta category (Marketing, Utility, Authentication) and MUST apply the corresponding priced category when calculating broadcast cost. |
| FR-021 | First vs Resend Detection | System MUST uniquely identify broadcast campaigns and recipients so that it can determine whether a message is the first send or a resend for pricing purposes and MUST apply resend pricing from the second send onward for applicable channels. |
| FR-022 | Token Deduction Granularity | System MUST deduct tokens per message based on per-message price and MUST only deduct tokens for messages with a final status indicating successfully sent or delivered, according to each channel provider. |
| FR-023 | Broadcast Blocking | System MUST prevent sending or scheduling any broadcast if the estimated total token cost exceeds the tenant's current token balance at the time of send, and MUST disable or hide send actions when token balance is zero or below the minimum needed for one message. |
| FR-024 | Token Usage Logs | System MUST record token usage for each broadcast as transaction entries containing tenant, broadcast id, channel, category (if applicable), send type (first/resend), number of successful messages, per-message price, total tokens deducted, and timestamp. |
| FR-025 | Low Credit Threshold | System MUST support a global low-credit threshold (initially 100.000 tokens) configurable by internal superadmin, and in future per-tenant overrides; when balance crosses below the threshold, System MUST trigger a low-credit notification. |
| FR-026 | Low Credit Notification | System MUST send low-credit email notifications in Bahasa Indonesia to the billing email address when the low-credit threshold is crossed downward and MUST avoid sending duplicate notifications for the same threshold until balance rises above it. |
| FR-027 | Core Access Continuity | System MUST allow all inbox and conversation features to function normally as long as the subscription is active, regardless of token balance, and MUST ensure broadcast blocking does not impact non-broadcast features. |
| FR-028 | Plan Limits | System MUST support per-plan limits for maximum agents, maximum channel accounts per type, and monthly broadcast volume, where each limit can be configured as a specific integer or set to "Unlimited". |
| FR-029 | Limit Enforcement | System MUST block creation of agents, channel accounts, or new broadcasts that would exceed configured limits and MUST show clear error messages in Bahasa Indonesia to users attempting these actions. |
| FR-030 | Billing Dashboard | System MUST provide a billing dashboard showing current plan, addon counts, token balance, upcoming and past invoices, and key usage indicators (active agents, active accounts per channel, broadcasts per channel this month). |
| FR-031 | Invoice Views | System MUST provide an invoice list view and invoice detail view for Admin and Finance users, with line items grouped by subscription, addons, tokens, and proration, and MUST allow downloading invoices as PDF with company branding. |
| FR-032 | Usage Analytics | System MUST provide a usage analytics dashboard summarizing current month charges, user and channel usage, storage usage, outbound message counts by channel, and an estimated end-of-month invoice total. |
| FR-033 | Usage Reports | System MUST allow Corporate Admin to generate usage reports with filters for date range, user/agent, channel, and department (if configured), and MUST support exporting generated reports as Excel, CSV, and PDF and scheduling them for email delivery. |
| FR-034 | Voucher Engine | System MUST support voucher codes that can be configured to provide free subscription months, free token amounts, or a combination, with validity periods and usage limits. |
| FR-035 | Voucher Redemption | System MUST allow Admins to redeem voucher codes from the billing UI, validate them, and apply their effects by discounting future invoices and/or crediting tokens, and MUST record voucher usage in billing logs. |
| FR-036 | Role-Based Access | System MUST restrict access to billing dashboard, invoice list/detail, pricing configuration, voucher management, and usage analytics to Admin, Finance, and Corporate Admin roles, and MUST block Agents from these sections. |

## **7\. Error Handling**

| ID | Type | Condition | System Behavior | UI Message (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- | ----- |
| EH-001 | Onboarding Payment | Payment for initial onboarding invoice (plan \+ addons \+ initial tokens) fails or is canceled. | Tenant remains inactive; configuration is saved as draft; user is returned to onboarding with clear banner and option to retry payment. | "Pembayaran gagal atau dibatalkan. Akun Anda belum aktif. Silakan ulangi proses pembayaran." |
| EH-002 | Monthly Invoice Payment | Payment for a monthly invoice fails (Bank Transfer mismatch, VA expired, or Apibayar error). | Invoice status set to "Gagal" or "Pending"; no changes are applied to plan/addons/tokens; banner on billing dashboard explains status; support is instructed via internal logs. | "Pembayaran untuk invoice ini belum berhasil. Silakan cek kembali nominal dan metode pembayaran Anda atau hubungi tim keuangan." |
| EH-003 | Manual Bank Transfer | Tenant selects Bank Transfer but uploads wrong reference or amount mismatches invoice total. | System flags payment as "Perlu verifikasi"; no automatic matching; finance user must manually confirm or reject. | "Pembayaran Anda sedang menunggu verifikasi karena terdapat perbedaan nominal atau referensi. Kami akan mengonfirmasi dalam 24 jam." |
| EH-004 | Virtual Account | Virtual Account payment notification from Apibayar fails or delayed. | System keeps invoice in "Pending" status; retries to fetch status; if not resolved within configured time, shows warning on invoice detail. | "Status pembayaran Virtual Account belum dapat dipastikan. Silakan cek kembali dalam beberapa saat." |
| EH-005 | Proration Calculation | Error while calculating proration for plan/addon upgrade or first partial month. | System blocks the configuration change, logs error details, and shows a generic ticket-suggesting message; no change is applied. | "Terjadi kesalahan saat menghitung prorata biaya. Perubahan belum disimpan. Silakan coba lagi atau hubungi tim dukungan." |
| EH-006 | Downgrade Request | Admin attempts to set a downgrade effective immediately instead of next cycle. | System prevents immediate downgrade and shows explanation that downgrades start next billing period. | "Penurunan paket/addon hanya dapat berlaku mulai periode tagihan berikutnya (tanggal 1). Perubahan Anda akan dijadwalkan." |
| EH-007 | Low Token Balance | Token balance below low-credit threshold and Admin opens broadcast module. | System shows non-dismissible warning banner; send/schedule still enabled until cost \> balance; if balance 0, all send actions disabled. | "Saldo token Anda hampir habis. Silakan top up token agar broadcast tidak terganggu." |
| EH-008 | Insufficient Tokens for Broadcast | Estimated broadcast cost exceeds current token balance. | System blocks send/schedule; keeps configuration; shows inline error and "Top up token" CTA. | "Saldo token tidak mencukupi untuk broadcast ini. Silakan kurangi penerima atau lakukan top up token." |
| EH-009 | Zero Tokens | Token balance \= 0 and user attempts to send broadcast. | System disables send/schedule actions and shows blocking banner; inbox remains usable. | "Broadcast sementara dinonaktifkan karena saldo token 0\. Silakan top up token untuk melanjutkan." |
| EH-010 | WA API Category Missing | Admin configures WhatsApp API broadcast without selecting Meta category. | System blocks save/send; highlights category field with error. | "Kategori WhatsApp (Marketing, Utility, Authentication) wajib dipilih untuk broadcast ini." |
| EH-011 | Meta Price Retrieval | System cannot retrieve or compute Meta base price for WhatsApp API broadcast. | System blocks cost estimation and sending for the broadcast; displays error; allows saving as draft. | "Terjadi kesalahan saat mengambil harga WhatsApp Official dari Meta. Broadcast tidak dapat dikirim saat ini. Silakan coba lagi beberapa saat lagi." |
| EH-012 | Voucher Invalid | Admin enters voucher code that does not exist. | System shows inline error; no changes applied. | "Kode voucher tidak ditemukan. Silakan periksa kembali kode Anda." |
| EH-013 | Voucher Expired | Admin enters voucher code past its validity date. | System shows inline error and does not apply voucher. | "Masa berlaku voucher ini sudah berakhir dan tidak dapat digunakan." |
| EH-014 | Voucher Already Used | Admin enters voucher code that has already been used up or exceeded usage limit. | System shows inline error describing usage limit reached. | "Voucher ini sudah digunakan sesuai batas pemakaian dan tidak dapat dipakai lagi." |
| EH-015 | Voucher Scope Mismatch | Voucher does not apply to current tenant (wrong plan, region, or promotion). | System rejects voucher and explains scope. | "Voucher ini tidak berlaku untuk paket atau akun Anda. Silakan gunakan voucher yang sesuai." |
| EH-016 | Invoice PDF Generation | Error when generating invoice PDF. | System logs error; shows on-screen message and suggests retry; no duplicate invoices created. | "Terjadi kesalahan saat membuat file PDF invoice. Silakan coba unduh kembali." |
| EH-017 | Usage Report Generation | Error generating usage report (data volume or system error). | System shows error toast and keeps filters; allows retry; logs technical details. | "Laporan penggunaan gagal dibuat. Silakan coba lagi beberapa saat lagi." |
| EH-018 | Usage Report Export | Error exporting usage report to Excel/CSV/PDF. | System shows error toast; no file download; logs error. | "Terjadi kesalahan saat mengunduh laporan. Silakan coba lagi atau gunakan format lain." |
| EH-019 | Analytics Dashboard Data | Failure retrieving analytics data for current month. | System shows partial data with skeleton states and inline info message; critical cards labeled as temporarily unavailable. | "Sebagian data analitik tidak dapat dimuat saat ini. Silakan coba muat ulang halaman." |
| EH-020 | Limit Exceeded – Agents | Admin attempts to increase agent count beyond plan max. | System blocks save; highlights agent field; suggests upgrade. | "Jumlah agent yang Anda masukkan melebihi batas paket. Silakan kurangi jumlah agent atau upgrade paket." |
| EH-021 | Limit Exceeded – Channels | Admin attempts to increase channel accounts beyond plan max per type. | System blocks save; shows per-row error in channel table. | "Jumlah akun untuk channel ini telah mencapai batas maksimum paket Anda." |
| EH-022 | Limit Exceeded – Broadcast Volume | Tenant attempts to create broadcast beyond monthly broadcast limit. | System blocks creation and shows a limit explanation. | "Batas jumlah broadcast bulanan telah tercapai. Silakan upgrade paket atau tunggu periode berikutnya." |

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | Related Requirements |
| ----- | ----- | ----- | ----- |
| EC-001 | Tenant onboarding occurs mid-month (for example 20th). | First month subscription and addons are charged prorated from activation date to month-end using calendar days; invoice clearly labels prorated items and formula; first monthly cycle still aligns to full calendar month after. | FR-007, FR-010, FR-011 |
| EC-002 | Multiple upgrades during same billing month (for example agent count increased twice). | System aggregates each upgrade as separate prorated line items based on their effective dates; invoice shows multiple prorated entries with formulas; no mid-month downgrades applied. | FR-010, FR-012 |
| EC-003 | Admin upgrades addon then immediately downgrades it again within same billing period. | Upgrade takes effect immediately with proration; downgrade is queued and only applied at next billing period; no negative proration or mid-cycle credit is given; invoice shows only upgrade proration. | FR-012, FR-013 |
| EC-004 | Admin upgrades plan tier mid-month and later upgrades addons under new tier. | Plan tier upgrade proration is calculated using price difference; addon upgrades use new tier prices; invoice shows separate proration lines for each change with clear labeling. | FR-010, FR-012 |
| EC-005 | Tenant has voucher providing free months and also performs mid-cycle upgrades. | Base subscription charge for covered months is discounted by voucher (zero or reduced), but addon proration still applies normally unless voucher explicitly covers addons; invoice line items show voucher discounts and proration separately. | FR-034, FR-035 |
| EC-006 | Voucher provides both free months and free tokens. | When redeemed, subscription invoice total is reduced for specified months; tokens are immediately credited; both effects are logged and shown in billing dashboard and logs. | FR-034, FR-035 |
| EC-007 | Two admins attempt to redeem the same voucher code concurrently. | System performs atomic validation; only the first redemption succeeds; second attempt receives "already used" error; voucher usage log records which tenant and user applied it. | FR-034, FR-035, EH-014 |
| EC-008 | Low-credit threshold is reached more than once in a short period due to multiple top ups and broadcast sends. | System sends low-credit email only when balance crosses from above to below threshold; if balance oscillates above and below later, notifications are sent again but not repeatedly while staying below threshold. | FR-025, FR-026 |
| EC-009 | WhatsApp API broadcast category is changed after scheduling but before send. | At send time, system uses the latest category selected in the broadcast configuration; cost estimation and actual token deduction always use the same category. | FR-020, FR-021 |
| EC-010 | Meta changes WhatsApp API prices mid-cycle. | Pricing configuration is updated internally on effective date; broadcasts scheduled before price change but sent after effective date use new price; activity logs include applied price version. | FR-018, FR-020 |
| EC-011 | Partial broadcast failures (some messages sent, some failed) due to channel issues. | System deducts tokens only for messages with final status "sent/delivered" per channel provider; failed or undelivered messages do not consume tokens; broadcast detail clearly indicates partial success and breakdown by status. | FR-022, FR-024 |
| EC-012 | Tenant removes a channel account but historical broadcasts reference that channel. | Removed channel account no longer usable for new broadcasts; historical records remain intact; reports and analytics still attribute past usage to that channel account. | FR-004, FR-032, FR-033 |
| EC-013 | Tenant exceeds monthly broadcast limit but still has token balance. | System blocks creation or sending of new broadcasts even if tokens are available; display explains that limit (not balance) is the blocking reason. | FR-028, FR-029 |
| EC-014 | Usage analytics dashboard is opened near month boundary (for example exactly at midnight). | Dashboard clearly indicates which billing period data is shown (current vs previous), and any ongoing invoice generation or data finalization is shown as a temporary state. | FR-032 |
| EC-015 | Usage report date range spans multiple billing periods. | Report aggregates usage across all selected dates; invoice attribution remains per billing period; exported report indicates billing period boundaries in rows or columns. | FR-033 |
| EC-016 | Bank transfer payment amount slightly exceeds or underpays invoice total. | Overpayment: system flags transaction for manual review; underpayment: invoice remains partially unpaid; no automatic settlement unless configured; billing dashboard shows status "Perlu penyesuaian". | FR-008, FR-011 |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Billing Dashboard – "Ringkasan Billing" | Landing view for billing and subscription overview. | 1\. Admin opens "Billing". 2\. Top section shows current plan card, "Detail paket", next invoice summary, and current token balance. 3\. Middle section shows tiles: "Invoice berjalan", "Tagihan tertunda", "Saldo token", "Prorata bulan ini". 4\. Bottom section links to "Riwayat top up", "Laporan penggunaan", "Pengaturan retensi data", and "Redeem voucher". All labels in Bahasa Indonesia. | US-009, US-015, US-017, US-021 |
| Invoice List – "Daftar invoice" | Table listing all invoices with key metadata. | 1\. User opens "Daftar invoice". 2\. Table shows columns "Nomor invoice", "Periode tagihan", "Tanggal terbit", "Jatuh tempo", "Status", "Total". 3\. Filters allow searching by status, periode, dan nomor invoice. 4\. Clicking a row opens invoice detail. | US-015, US-017 |
| Invoice Detail – "Detail invoice" | Detailed invoice view with proration explainer. | 1\. User opens a specific invoice. 2\. Header shows company info, invoice number, billing period, due date, and status. 3\. Line item section is grouped: "Biaya paket bulanan", "Addon channel", "Addon agent", "Addon retensi data", "Top up token", "Diskon voucher". 4\. For any prorated line item, an inline explainer is shown such as "Dihitung prorata: (Hari aktif {x} / {y} hari) × Rp {harga}" in Bahasa Indonesia. 5\. Footer shows subtotal, PPN 11%, and total; actions: "Bayar sekarang" (if unpaid), "Unduh PDF". | US-016, US-017 |
| Top Up History – "Riwayat top up" | Transaction history of token top ups. | 1\. User opens "Riwayat top up". 2\. Table shows "Tanggal", "Metode pembayaran", "Nominal (Rp)", "Token", "Status", "Referensi". 3\. Filters by date range and status; button "Top up token" always visible. 4\. Export button "Unduh riwayat" offers CSV/Excel/PDF. | US-010 |
| Token Usage Log – "Log penggunaan token" | Detailed token deduction per broadcast and channel. | 1\. User opens "Log penggunaan token". 2\. Filters by date range, channel, broadcast, category (for WhatsApp API). 3\. Table columns: "Tanggal", "Kampanye", "Channel", "Kategori", "Jenis kirim (pertama/ulang)", "Jumlah pesan sukses", "Biaya per pesan (token)", "Total token". 4\. Each row links to broadcast detail page. | US-012, FR-024 |
| Broadcast Detail – "Detail broadcast" | Per-broadcast breakdown including cost. | 1\. User opens a broadcast from broadcast module or token usage log. 2\. Tabs: "Ringkasan", "Pesan", "Penerima", "Biaya". 3\. "Biaya" tab shows summary cards per channel/category and a table listing messages per pricing bucket with token totals and status counts. 4\. Text is in Bahasa Indonesia. | US-011, US-012 |
| Usage Analytics Dashboard – "Usage analytics" | High-level usage metrics and estimated invoice. | 1\. User navigates to "Usage analytics". 2\. Cards show "Perkiraan tagihan bulan ini", "Jumlah agent aktif", "Jumlah akun channel aktif", "Pesan keluar per channel", "Penggunaan storage (GB)". 3\. Graphs show outbound messages per day per channel, storage usage trend, and token consumption trend. 4\. Tooltip texts and legends in Bahasa Indonesia. | US-019, FR-032 |
| Usage Reports – "Laporan penggunaan" | Report generation UI. | 1\. User opens "Laporan penggunaan". 2\. Filter controls: date range picker, dropdown "Pilih agent", dropdown "Pilih channel", dropdown "Departemen" (jika tersedia). 3\. Button "Generate laporan" triggers server-side generation and shows progress. 4\. Results shown in table; export buttons for Excel/CSV/PDF; toggle "Jadwalkan laporan via email". | US-020, FR-033 |
| Voucher Redemption – "Redeem voucher" | UI to redeem voucher codes. | 1\. User opens "Redeem voucher". 2\. Form input "Kode voucher" plus button "Gunakan". 3\. After validation, a summary box explains benefit: "Gratis X bulan biaya paket", "Bonus token Y", atau kombinasi, all in Bahasa Indonesia. 4\. User confirms "Terapkan voucher"; success toast appears and billing dashboard updates. | US-018, FR-035 |
| Low Credit Email Template | Email notifying low token balance. | 1\. System sends email when crossing low-credit threshold. 2\. Subject: "Saldo token Satuinbox Anda hampir habis". 3\. Body: explains current balance, example broadcast capacity, and CTA button "Top up sekarang" linking to billing dashboard. | US-014, FR-026 |
| Addon Management UI – "Kelola addon" | Manage channel and agent addons after onboarding. | 1\. From billing dashboard, user clicks "Kelola addon". 2\. Table lists each addon with current quantity, maximum allowed, and price per unit. 3\. Edits show immediate recalculation of future monthly total and label "Perubahan upgrade akan dihitung prorata dan ditagihkan bulan ini" or "Perubahan downgrade akan berlaku mulai periode berikutnya". | US-006, US-007, FR-010–FR-013 |
| Plan Management UI – "Kelola paket" | Manage plan tier upgrades/downgrades. | 1\. User opens "Kelola paket". 2\. Current plan card at top; alternative plans below with "(Upgrade)" or "(Penurunan paket)" tags. 3\. Selecting upgrade shows proration estimate in modal with formula; selecting downgrade shows next-cycle effective date information. | US-008, US-009, FR-010–FR-013 |

---

## **10\. Field & Validation**

| Field Name (UI Label in Bahasa Indonesia) | Context | Type | Example Value | Validation Rules | Required |
| ----- | ----- | ----- | ----- | ----- | ----- |
| "Paket berlangganan" | Onboarding – pilih paket | Enum / radio | "Paket Individual" | Must select exactly one active plan; only plans marked as available are displayed. | Yes |
| "Jumlah akun WhatsApp API" | Addon configuration | Integer | 2 | Integer \>= 0; must not exceed plan max accounts for WhatsApp API; 0 allowed. | Yes |
| "Jumlah akun WhatsApp Web" (jika ditampilkan terpisah) | Addon configuration | Integer | 1 | Integer \>= 0; must not exceed plan limit; 0 allowed. | Yes |
| "Jumlah akun Instagram" | Addon configuration | Integer | 1 | Integer \>= 0; must not exceed plan limit. | Yes |
| "Jumlah akun Facebook" | Addon configuration | Integer | 1 | Integer \>= 0\. | Yes |
| "Jumlah akun Telegram" | Addon configuration | Integer | 0 | Integer \>= 0\. | Yes |
| "Jumlah akun Email" | Addon configuration | Integer | 1 | Integer \>= 0\. | Yes |
| "Jumlah agent" | Addon configuration | Integer | 5 | Integer \>= 0; must not exceed plan's max agent limit; 0 only allowed if tenant understands no active agents. | Yes |
| "Opsi retensi data" | Addon configuration | Enum / radio | "Tanpa addon (retensi default paket)" | Must select one option among default, 20GB, 100GB; prices sourced from pricing matrix; downgrade shows warning. | Yes |
| "Nominal top up (Rp)" | Token top up (onboarding dan ongoing) | Integer | 100000 | Integer; \>= minimum amount (initially 100000); no decimals; maximum per transaction configurable. | Yes |
| "Metode pembayaran" | Payment selection | Enum | "Transfer Bank", "Virtual Account" | Must select one; list defined in configuration; may affect payment processing workflow. | Yes |
| "Referensi pembayaran" | Bank transfer proof | String | "INV-202512-00001" | Optional free text; recommended to match invoice number; may be used for semi-automatic reconciliation. | Optional |
| "Email tagihan" | Billing settings | Email string | "billing@company.com" | Valid email format; used for invoice and low-credit notifications. | Yes |
| "Ambang saldo rendah" | Billing settings (future per-tenant override) | Integer | 100000 | Integer \>= 0; if 0, may disable custom threshold and fall back to system default; not exposed to tenant in first version. | Optional (internal) |
| "Kategori WhatsApp" | WhatsApp API broadcast setup | Enum | "Marketing" | Must select one of "Marketing", "Utility", "Authentication"; used to pick Meta base price. | Yes (for WA API) |
| "Kode voucher" | Voucher redemption | String | "FREE2MONTHS" | Alphanumeric; trimmed of whitespace; max length (for example 32 chars); case-insensitive comparison; must exist, valid, not expired, and within usage limit. | Yes (when redeeming) |
| "Periode laporan" | Usage report generation | Date range | 2025-01-01 to 2025-01-31 | Start date \<= end date; range not exceeding configured maximum (for example 12 months). | Yes |
| "Pilih agent" | Usage report filter | Enum / multi-select | "Semua agent" atau specific agent | Optional; if none selected, includes all agents; values must refer to existing active or historical agents. | Optional |
| "Pilih channel" | Usage report filter | Enum / multi-select | "WhatsApp API", "Email" | Optional; if none selected, includes all channels. | Optional |
| "Departemen" | Usage report filter (jika diaktifkan) | Enum / multi-select | "Sales", "Support" | Optional; only shows departments configured for tenant. | Optional |
| "Format ekspor" | Usage report export | Enum | "Excel" | Must be one of "Excel", "CSV", "PDF". | Yes |
| "Tanggal mulai paket" | Plan activation date | Date | "2025-01-20" | Must be today or future date for first activation; in migration scenarios may be set manually by internal admin. | Yes |
| "Status invoice" | Invoice record | Enum | "Draft", "Terbit", "Lunas", "Jatuh tempo", "Overdue", "Dibatalkan" | Derived from billing logic; not editable by tenant. | System field |
| "Nomor invoice" | Invoice record | String | "INV-202512-00023" | Must follow pattern "INV-YYYYMM-XXXXX"; unique across system. | System field |
| "Jatuh tempo" | Invoice record | Date | 2025-01-15 | Auto-calculated as 14 days from invoice date by default; may be configurable by internal admin. | System field |

---

## **11\. Non-Functional Requirements**

| ID | Category | Requirement |
| ----- | ----- | ----- |
| NFR-001 | Performance | Billing dashboard, invoice list, and invoice detail views MUST load within 2 seconds P95 for tenants with up to 12 months of invoices and moderate usage; usage analytics queries and cost estimations MUST respond within 3 seconds P95. |
| NFR-002 | Reliability | Invoice generation, token top up processing, and broadcast cost deduction MUST be idempotent and resilient; in case of transient failures the system MUST retry safely without creating duplicate invoices or double-charging tokens. |
| NFR-003 | Security | Billing data, invoices, voucher configuration, and usage analytics MUST only be accessible to authorized roles (Admin, Finance, Corporate Admin) and follow existing Satuinbox authentication and authorization policies. |
| NFR-004 | Compliance | Invoice format, PPN 11% calculation, and numbering MUST comply with Indonesian tax and invoicing guidelines as defined by Satuinbox finance policy. |
| NFR-005 | Observability | Billing and pricing flows (invoice generation, proration, token deduction, voucher redemption) MUST be fully logged with correlation IDs so that support and engineering can trace and debug issues end-to-end. |

---

## **12\. Dependencies & Risks**

| ID | Type | Item | Description |
| ----- | ----- | ----- | ----- |
| DR-001 | Dependency | Apibayar & Banking Channels | All invoice and top up payments depend on Apibayar and banking channels for Virtual Account and Bank Transfer flows; outages or API changes can delay payment confirmation and activation. |
| DR-002 | Dependency | Meta WhatsApp Pricing | WhatsApp API broadcast pricing relies on Meta category tariffs; changes in pricing or API access could affect margins; system must keep pricing tables updated and resilient to fetch failures. |
| DR-003 | Risk | Proration & Complexity | Complex combinations of plan/addon upgrades, scheduled downgrades, vouchers, and partial months increase risk of billing errors and customer confusion; mitigated by clear UI explainers, consistent formula usage, extensive testing, and robust analytics/reporting to validate charges. |

## **13\. Success Metrics**

| ID | Metric | Target | Measurement Method |
| ----- | ----- | ----- | ----- |
| SM-001 | Billing accuracy and proration correctness | 100% invoices generated with correct plan, addons, proration, tax, and token usage; 0 manual adjustments due to system miscalculation per month. | Automated reconciliation scripts comparing expected vs actual charges; sampled invoice reviews by Finance. |
| SM-002 | Broadcast continuity vs token protection | 0 negative token balance incidents; 100% broadcasts blocked before send when balance is insufficient; 100% inbox operations available even when broadcasts are blocked. | Logs of token balance transitions; audits of blocked vs allowed broadcast attempts; incident postmortems. |
| SM-003 | Billing transparency and usability | \< 5% of total monthly support tickets related to confusion about pricing/billing; \>= 80% Admin CSAT on billing dashboards, invoices, and usage reports. | Support ticket tagging; CSAT survey after viewing invoices/usage dashboards. |

---

## **14\. Future Considerations**

| ID | Item | Description |
| ----- | ----- | ----- |
| FC-001 | Multi-currency and regional pricing | Support billing and token pricing in multiple currencies, with FX conversion rules and currency-specific Meta tariffs where applicable. |
| FC-002 | Advanced discounts and commitments | Add long-term commitment discounts, tiered usage discounts, and contract-based minimums on top of the existing voucher mechanism. |
| FC-003 | Flexible billing cycles and consolidated billing | Support non-1st billing dates for specific enterprise contracts and consolidated invoices across multiple related tenants or brands. |

---

## **15\. Limitations**

| ID | Limitation | Impact | Possible Mitigation |
| ----- | ----- | ----- | ----- |
| L-001 | Single-currency IDR and fixed 1 token \= Rp 1 mapping | Cannot natively support other currencies or variable token values; Meta pricing assumed in IDR. | Use manual conversion for international customers until multi-currency support (FC-001) is implemented. |
| L-002 | WhatsApp API pricing dependency on manually maintained Meta tables | Price changes from Meta require configuration updates; temporary mismatch possible if updates are delayed. | Establish internal process to update Meta pricing promptly; add monitoring for price-change announcements. |
| L-003 | Per-tenant low-credit thresholds and complex voucher combinations not fully self-service at launch | Threshold override and complex voucher campaigns initially managed via internal superadmin tools only. | Gradually expose safe self-service controls with guardrails and better validation once usage stabilizes. |

---

## **16\. Appendix**

### **16.1 Appendix A-001 – Pricing Matrix (Initial Configuration)**

*All values are initial defaults. All prices are configurable per plan tier by internal superadmin. All broadcast per-message prices are charged in tokens (1 token \= Rp 1).*

#### **16.1.1 Subscription, Channel Addons, Agent Addons, Retention**

| Item | Plan Tier | Price (IDR) | Unit | Notes |
| ----- | ----- | ----- | ----- | ----- |
| Base subscription | Individual | \[Configurable\] | per tenant / month | Includes default 2-month data retention; initial limits see Appendix A-002. |
| Base subscription | Enterprise | \[Configurable\] | per tenant / month | Same default retention; higher limits possible. |
| WhatsApp API channel addon | Individual | 250,000 | per account / month | Price can differ per tier in future. |
| WhatsApp API channel addon | Enterprise | 250,000 | per account / month | Same initial price; tier-specific later. |
| WhatsApp Web channel account (Baileys) | Individual | \[Configurable\] | per account / month | If exposed as separate channel; default can follow WhatsApp API or be distinct. |
| WhatsApp Web channel account (Baileys) | Enterprise | \[Configurable\] | per account / month |  |
| Instagram channel addon | Individual | 100,000 | per account / month |  |
| Instagram channel addon | Enterprise | 100,000 | per account / month |  |
| Facebook channel addon | Individual | 100,000 | per account / month |  |
| Facebook channel addon | Enterprise | 100,000 | per account / month |  |
| Telegram channel addon | Individual | 100,000 | per account / month |  |
| Telegram channel addon | Enterprise | 100,000 | per account / month |  |
| Email channel addon | Individual | 150,000 | per account / month |  |
| Email channel addon | Enterprise | 150,000 | per account / month |  |
| Agent addon | Individual | 199,000 | per agent / month | Can differ per tier in future. |
| Agent addon | Enterprise | 199,000 | per agent / month |  |
| Data retention 20GB addon | Individual | 100,000 | per 20 GB / month | On top of default 2-month retention. |
| Data retention 20GB addon | Enterprise | 100,000 | per 20 GB / month |  |
| Data retention 100GB addon | Individual | 400,000 | per 100 GB / month |  |
| Data retention 100GB addon | Enterprise | 400,000 | per 100 GB / month |  |
| Minimum token top up | All tiers | 100,000 | per top up | 1 token \= Rp 1; additional constraints configurable. |

#### **16.1.2 Broadcast Pricing – WhatsApp Web (Baileys)**

| Channel | Plan Tier | First Broadcast Price | Second+ Broadcast Price | Unit | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- |
| WhatsApp Web (Baileys) | Individual | 100 tokens | 75 tokens | per delivered message | Applied per unique recipient within the same campaign: first send uses first price; second and subsequent sends use second price while no reply. |
| WhatsApp Web (Baileys) | Enterprise | 100 tokens | 75 tokens | per delivered message | Values can diverge by tier in future. |

#### **16.1.3 Broadcast Pricing – WhatsApp API (Official, Meta-Based)**

*Base prices are from Meta and may change. System uses latest configured values and applies markup.*

| Category | Meta Base Price (IDR) | Markup | Satuinbox Price (before token conversion) | Unit | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Marketing | 586.33 | \+0.5% | 586.33 × 1.005 | per delivered message | Final Rupiah price per message is converted to tokens and may be rounded according to finance policy. |
| Utility | 356.65 | \+0.5% | 356.65 × 1.005 | per delivered message |  |
| Authentication | 356.65 | \+0.5% | 356.65 × 1.005 | per delivered message |  |

Rounding rule (for example round half up to nearest token) must follow Satuinbox finance policy and may be specified or updated outside this PRD without changing the functional behavior (always 1 token \= Rp 1).

#### **16.1.4 Broadcast Pricing – Other Channels**

| Channel | Plan Tier | Price | Unit | Notes |
| ----- | ----- | ----- | ----- | ----- |
| Telegram | All tiers | 100 tokens | per delivered message | Same price for first and resend (initially); can be extended to separate resend pricing. |
| Facebook | All tiers | 100 tokens | per delivered message |  |
| Email | All tiers | 100 tokens | per delivered message |  |

---

### **16.2 Appendix A-002 – Plan Limits (Initial Configuration)**

| Plan Tier | Max Agents | Max Accounts per Channel | Monthly Broadcast Limit | Default Data Retention | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Individual | Unlimited (initial) | Unlimited (initial) | Unlimited (initial) | 2 months | Limits are stored per plan and can be reduced or increased later without code changes. |
| Enterprise | Unlimited (initial) | Unlimited (initial) | Unlimited (initial) | 2 months | Structure supports different limits per tier. |

---

### **16.3 Appendix A-003 – Proration and Billing Rules**

| Item | Rule | Notes |
| ----- | ----- | ----- |
| Billing period | 1st to last day of calendar month for all tenants. | Billing timezone is Asia/Jakarta (WIB). |
| Proration formula | (Days active or remaining / Total days in month) × Monthly price. | Applies to mid-cycle upgrades and first partial month; uses calendar days. |
| Upgrade timing | Plan and addon upgrades are effective immediately. | Prorated charges for remainder of month appear as invoice line items with "Prorata" label. |
| Downgrade timing | Plan and addon downgrades are only effective from next billing period (1st). | No mid-cycle refunds; current month continues with old configuration. |
| Invoice generation | Automatically at 00:00 WIB on 1st of following month. | Covers previous month; no manual intervention required. |
| Invoice format | PDF with company branding, KYB company details, billing period, line items (including proration), subtotal, PPN 11%, total, payment instructions, due date. | Invoice number format: INV-YYYYMM-XXXXX (sequential). |
| Payment methods | Bank Transfer (manual), Virtual Account (auto-verification). | Payment matching primarily via amount and reference; confirmation expected within 24 hours. |
| Due date | Default 14 days from invoice date. | Configurable internally per contract, if necessary. |

---

### **16.4 Appendix A-004 – Usage Tracking & Analytics Dimensions**

| Area | Dimension | Description |
| ----- | ----- | ----- |
| Users & Agents | Agent id, role, department, active days | Used to show agent counts and changes over time. |
| Channels | Channel type, account id, status | Used to count active Instagram, Facebook, Telegram, Email, WhatsApp API/Web accounts. |
| Messages | Channel, direction, category (for WhatsApp API), status | Used to count outbound messages per channel and category and derive broadcast costs. |
| Storage | Tenant id, storage used (GB), date | Used to display storage usage trend against retention addons. |
| Billing | Charge type, plan tier, addon type, token transaction id | Used in usage analytics to reconcile consumption and invoices. |

---

### **16.5 Appendix A-005 – Voucher Types**

| Voucher Type | Effect | Example Use Case |
| ----- | ----- | ----- |
| Free subscription months | Reduces or zeroes base subscription and optionally addon charges for specific number of future months. | Promotions such as "Free 2 months for new customers". |
| Free token balance | Credits a fixed token amount to tenant balance upon redemption. | Campaigns like "Bonus 100.000 token for early adopters". |
| Combined voucher | Provides both free subscription months and free token balance with a single code. | Larger enterprise or seasonal promotions. |

---

## **Notes**

1. Exact rounding rules from Rupiah to tokens for Meta-based WhatsApp API pricing (for example round up vs round half up) are to be defined and maintained by Finance; system must ensure the rule is applied consistently across estimation, deduction, and reporting.  
2. Concrete base subscription prices per plan tier (Individual, Enterprise, and future tiers) are not specified here and must be configured in the internal pricing system before go-live.  
3. Any future changes to PPN rate or invoicing regulations must be handled by updating billing configuration and invoice templates without altering the core functional behavior defined in this PRD.

