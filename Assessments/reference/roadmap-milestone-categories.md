# Roadmap Kategori — Master Reference & Task Assignment

**Scope:** Roadmap QA Browser (95 task) + OpenProject SatuInbox `prod-2.8.3` (59 WP)
**Updated:** 2026-10-12 — divalidasi Dany

---

## Daftar Kategori (updated 2026-10-12)

**Prinsip:** objek menentukan kategori, bukan jenis aktivitas.

### Primary (14)

| # | slug | Nama | Task v2.8.3 |
|---|---|---|---|
| 1 | `superadmin` | SuperAdmin Global Company Access | 2 |
| 2 | `export` | Advanced Offline Export Suite | 5 |
| 3 | `release` | Release Engineering v2.8.x | 9 |
| 4 | `sales` | Sales Module Revamp & Leads | 6 |
| 5 | `conversation` | Conversation & Inbox Experience | 10 |
| 6 | `ticket` | Ticketing & Post-Sales Flow | 5 |
| 7 | `channels` | Channel Expansion & WhatsApp Web | 11 |
| 8 | `broadcast` | Broadcast & Anti-Spam Engine | 5 |
| 9 | `analytics` | Analytics & Reporting | 6 |
| 10 | `ai` | AI & Automation | 3 |
| 11 | `notification` | Notification Service | 1 |
| 12 | `widget` | Widget Platform | 3 |
| 13 | `setting` | Settings & Onboarding | 2 |
| 14 | `growth` | Growth, GTM & Demo Readiness | 6 |

### Supporting (4)

| # | slug | Nama | Task v2.8.3 |
|---|---|---|---|
| 1 | `infra` | Infra, Performance & Security Hardening | 6 |
| 2 | `billing` | Billing, Subscription & Fraud | 6 |
| 3 | `stab` | Production Stabilization - Incidents & Bugfix | 1 |
| 4 | `ops` | Ops, QA & BAU | 8 |

**Master 18 kategori · 18 aktif di v2.8.3 · 95 task.**

> Perubahan 2026-10-12 (validasi Dany): `notification` dipisah dari ai · `widget` berdiri sendiri · `setting` kategori baru (config/onboarding umum, bukan payment/widget/channel di menu Settings) · `sap` DIHAPUS total (task SAP/Lincah/AWB route ke objek: awb→channels, payment→billing). `api` sudah dibubarkan sebelumnya (1A–10A → objek).

## Task Assignment per Kategori

Legend: `[RM]`=roadmap-only · `[OP]`=OP-only · `[RM+OP]`=merged

### 1. superadmin — SuperAdmin Global Company Access [primary] (2)

| ID | OP | Judul |
|---|---|---|
| t01 | 2332 | SuperAdmin Global Company Access — Phase 2: Tenant Impersonation (Read-Only) + Audit |
| op-2331 | 2331 | SuperAdmin Global Company Access — Phase 1: Company List/Search + Onboarding Approval |

### 2. export — Advanced Offline Export Suite [primary] (5)

| ID | OP | Judul |
|---|---|---|
| t09 | 2909 | Advanced Offline Export |
| op-3189 | 3189 | Phase-A advance export - Export Row-Level Collections + Zero-Impact Sync Pipeline |
| op-3190 | 3190 | Phase-B advance export - Column Registry + Configurable Column Export |
| op-3191 | 3191 | Phase-C advance export - Broadcast Export (Recipient + Campaign Level) |
| op-3192 | 3192 | Phase-D advance export - SAP Template Preset (4-Sheet Export) |

### 3. release — Release Engineering v2.8.x [primary] (9)

| ID | OP | Judul |
|---|---|---|
| op-2965 | 2965 | mapping automation satuinbox |
| op-3161 | 3161 | Technical Analysis v2.8.1/2/3 |
| op-3734 | 3734 | monitoring release v2.8.2 |
| op-3762 | 3762 | brainstorming UIUX n QA flow |
| op-3788 | 3788 | brainstorming workflow conversation breakdown qa |
| op-3799 | 3799 | Align Repo and create branch v2.8.3 |
| op-3977 | 3977 | gathering UI/UX + QA flow |
| op-4154 | 4154 | realign task v2.8.3 |
| op-4289 | 4289 | QA product meeting - audit converseation |

### 4. sales — Sales Module Revamp & Leads [primary] (6)

| ID | OP | Judul |
|---|---|---|
| t07 | 4432 | sales module — PRD + P0 fixes (security scope, transition guard, team transfer) |
| t15 | 4433 | create prospect from conversation |
| t20 | 4457 | sales module — revamp UI/workflow |
| op-1836 | 1836 | Leads - Lead Assignee Update Does Not Realtime Sync to Assigned Agent |
| op-2970 | 2970 | Requirement Allignment Sales modul ( BD ) |
| op-3727 | 3727 | Sales Modul improvement |

### 5. conversation — Conversation & Inbox Experience [primary] (10)

| ID | OP | Judul |
|---|---|---|
| t10 | 4435 | informative utilities (deskripsi fitur + utility message conversation) |
| t14 | 4439 | grouping contact (unifikasi contact lintas channel) |
| t16 | 4431 | UI conversation redesign — audit UX |
| t17 | 4437 | UI conversation redesign — implementasi |
| tmv4r29na1 | 4441 | 2A — Link Chat to Ticket via Open API |
| op-3006 | 3006 | Global Search Suggestion - No toast message when release relation label on conversation/ticket detail |
| op-3146 | 3146 | Feature alignment conversation mobile and web |
| op-3201 | 3201 | global search logic improvements |
| op-3214 | 3214 | Global Search Suggestion - Search typo tolerance was not working in production version |
| op-4128 | 4128 | Conversation - room - issue related to message |

### 6. ticket — Ticketing & Post-Sales Flow [primary] (5)

| ID | OP | Judul |
|---|---|---|
| t12 | 4436 | ticketing KPI card + dynamic status |
| tmv4r29na0 | 4440 | 1A — Ticket Grouping by Custom Attribute |
| tmv4r29na2 | 4442 | 3A — Bulk Ticket Update |
| tmv4r29na7 | 4455 | 8A — Ticket Webhook Enhancement + Two-Way Sync |
| tmv4r29na8 | 4458 | 9A — Update Team Inbox via Open API |

### 7. channels — Channel Expansion & WhatsApp Web [primary] (11)

| ID | OP | Judul |
|---|---|---|
| t04 | 666 | Auto Split Broadcast for Natural Message Anti Spam System |
| t27 | 168 | telegram channel (resume pending dev) |
| t28 | 2183 | shopee chat |
| t29 | 2830 | tiktok chat |
| op-2135 | 2135 | Whatsapp web - handle temporary banned (on whatsapp web and mobile) |
| op-3275 | 3275 | Shopee seller research |
| op-3281 | 3281 | Research broadcast whatsapp web |
| op-3520 | 3520 | Call log from whatsapp |
| op-3774 | 3774 | Conversation - Whatsapp API - late message from webhook |
| op-3868 | 3868 | Brainstorming Bad decrypt (lion parcel issue) |
| op-3973 | 3973 | WA Web Multi-Library: whatsmeow Connector Architecture Brief |

### 8. broadcast — Broadcast & Anti-Spam Engine [primary] (5)

| ID | OP | Judul |
|---|---|---|
| tmv4r29na3 | 4443 | 4A — Broadcast Create via Open API with Attachment |
| tmv4r29na4 | 4444 | 5A — Create Broadcast via Deep Link |
| tmv4r29na5 | 4445 | 6A — Broadcast Channel Expansion + Attachment Types |
| tmv4r29na6 | 4446 | 7A — Broadcast Status, History & Retry |
| op-3199 | 3199 | Broadcast - WAPI - broadcast wapi not follow broadcast hour |

### 9. analytics — Analytics & Reporting [primary] (6)

| ID | OP | Judul |
|---|---|---|
| tmucfgez3 | 4371 | MUV - monthly unique visitor |
| op-3691 | 3691 | Analytics UI/UX-Polish - Unformatted Floating-Point Numbers in Chart Hover Tooltips |
| op-3708 | 3708 | Analytics - Responsiveness (Ketanggapan) section - Cross-Agent SLA Synchronization Leak Across Multi-Assignee Conversations |
| op-3709 | 3709 | Analytics - Responsiveness (Ketanggapan) section - FRT Detail View Queries Initial Assignee ID Instead of First Message Sender |
| op-3711 | 3711 | Analytics - Responsiveness (ketanggapan) section - Inverted Agent Attribution in RLT Average Metric Aggregation |
| op-3732 | 3732 | [Analytics] Unique Inbound Clients per Channel (MUV) |

### 10. ai — AI & Automation [primary] (3)

| ID | OP | Judul |
|---|---|---|
| t23 | 4453 | chat bot auto response (AI agent + eskalasi human) |
| t24 | 2910 | converesation AI summary |
| tmtwdn18t | 2910 | Email summary |

### 11. notification — Notification Service [primary] (1)

| ID | OP | Judul |
|---|---|---|
| t06 | 2697 | Notification Service Improvement |

### 12. widget — Widget Platform [primary] (3)

| ID | OP | Judul |
|---|---|---|
| t11 | 4450 | faq (halaman FAQ in-app) |
| t19 | 2908 | widget module (UI/UX + workflow + domain per widget) |
| t26 | 4454 | widget app (web/mobile app, Google login) |

### 13. setting — Settings & Onboarding [primary] (2)

| ID | OP | Judul |
|---|---|---|
| t13 | 4438 | simplicity settings (redesign + guidance) |
| t18 | 4451 | wizard setting onboarding (quick guide sekali muncul) |

### 14. growth — Growth, GTM & Demo Readiness [primary] (6)

| ID | OP | Judul |
|---|---|---|
| t02 | 2366 | GTM Marketing untuk satuinbox |
| t03 | 4430 | demo data base and dashboard (kandidat request demo) |
| tmv4r29na9 | 4459 | 10A — Integration Identifiers Documentation |
| op-3183 | 3183 | demo form landing page |
| op-3305 | 3305 | Research strategy satuinbox - Audit |
| op-4282 | 4282 | meeting detail GTM |

### 15. infra — Infra, Performance & Security Hardening [supporting] (6)

| ID | OP | Judul |
|---|---|---|
| t05 | 4456 | infra stability — slice 1: SLO + top incident fixes |
| t21 | 4452 | DB topology HOT/WARM/COLD (+ exclude conversation group) |
| t25 | 2449 | chat tools API (communication layer pihak ketiga) |
| op-2901 | 2901 | MongoDB read preference: per-service/per-query overrides + secondaryPreferred on analytics-exclusive aggregations |
| op-3200 | 3200 | browser compability (flacky) |
| op-3394 | 3394 | Improvement RMQ issue |

### 16. billing — Billing, Subscription & Fraud [supporting] (6)

| ID | OP | Judul |
|---|---|---|
| t08 | 4434 | cost simulation WA official + guarding |
| t22 | 3400 | fraud dashboard (invoice fraud via broadcast + integrasi Lincah) |
| op-1271 | 1271 | Settings- Subs - Payment - QRIS/ All Vendor E-Wallet Payment Fails to Load in Pay Invoice Modal |
| op-3327 | 3327 | Non aktifkan user prod yang sudah end subs nya |
| op-3400 | 3400 | Fraud team request (Hafizh) |
| op-3733 | 3733 | [WA Web] Geography-Based Entitlement Exclusion (Indonesia-only) |

### 17. stab — Production Stabilization - Incidents & Bugfix [supporting] (1)

| ID | OP | Judul |
|---|---|---|
| op-3194 | 3194 | research root cause delay email, disconnected email |

### 18. ops — Ops, QA & BAU [supporting] (8)

| ID | OP | Judul |
|---|---|---|
| op-3731 | 3731 | brainstorm satuinbox x lincah (rayyan) |
| op-3843 | 3843 | all product meeting 29-09-2026 |
| op-3844 | 3844 | satuinbox product presentation 01-10-2026 |
| op-3889 | 3889 | quick brief satuinbox 29-09-2026 |
| op-3912 | 3912 | meeting satuinbox x lion parcel |
| op-4115 | 4115 | all product meeting 06-10-2026 |
| op-4116 | 4116 | satuinbox presentation 06-10-2026 |
| op-4155 | 4155 | meeting satuinbox x lincah |
