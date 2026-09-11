# SatuInbox Product Strategy, Task Prioritization & Roadmap Requirements

## 1. Purpose

Single source of truth untuk dua visual utama: 1. SatuInbox Big Picture
2. SatuInbox Task Prioritization & Timeline

Dokumen ini menggabungkan seluruh requirement, task description,
priority rule, dependency rule, timeline rule, readiness rule, dan
visual specification.

Sumber awal adalah `satuinbox task timeline - Sheet1.csv`, yang memuat
kategori BACKLOG, CURRENT TASK, FEATURE, UI/UX, effort/impact/testing,
TIME, dan rekomendasi Big Picture. fileciteturn0file0L10-L36

------------------------------------------------------------------------

# 2. SatuInbox Big Picture

## Positioning

**SatuInbox = Omnichannel Chat Platform**

Core flow:

``` text
Omnichannel Channels
        ↓
SatuInbox Platform
        ↓
Product Modules
        ↓
Business Value
```

## Omnichannel Channels

-   Website Widget
-   WhatsApp Official / BSP
-   WhatsApp Web
-   Instagram
-   Facebook
-   Email
-   TikTok Chat
-   Shopee Chat
-   API Integration

## Product Modules

-   Omnichannel Chat
-   Ticket
-   Sales
-   Broadcast
-   Analytics
-   AI
-   Tools / Add-ons
-   Payment
-   Theme
-   Affiliate
-   Notification
-   Mobile App
-   Open API

## Strategic Areas

Rekomendasi Big Picture dari sheet:

1.  Analytics
2.  Open API
3.  Broadcast
4.  Omnichannel Chat
5.  Ticket
6.  Sales
7.  Tools / Add-ons
8.  AI
9.  Theme
10. Affiliate
11. Payment
12. Notification
13. Mobile App

Daftar tersebut berasal dari bagian
`big picture satuinbox rekomendation` pada sheet.
fileciteturn0file0L23-L36

------------------------------------------------------------------------

# 3. Task Prioritization Rules

## Primary rule

Prioritas **HARUS** mengikuti:

**Impact ↓ → Effort ↑ → Testing ↑**

Urutan pengambilan keputusan:

1.  Impact menjadi faktor utama.
2.  Jika Impact sama, Effort lebih rendah diprioritaskan.
3.  Jika Impact dan Effort sama, Testing lebih rendah diprioritaskan.
4.  Dependency menjadi constraint timeline.

Target utama:

``` text
LHL
LHM
MHL
MHM
...
```

Jangan memakai total score yang memungkinkan `High Effort + Low Impact`
mengalahkan `Low Effort + High Impact`.

## Impact

Impact menilai seberapa besar suatu fix/fitur membawa SatuInbox ke arah
yang lebih baik.

Pertimbangkan: - product direction - business value - customer
experience - operational improvement - reliability - scalability -
strategic importance - cross-module benefit

## Effort

Effort adalah kompleksitas implementasi: - engineering effort - scope -
architectural complexity - frontend/backend work - integration -
migration - operational complexity

## Testing

Testing bukan sekadar lama QA. Testing mencakup: - jumlah metode
testing - waktu testing - regression area - area terdampak - integration
testing - cross-module impact - channel-specific testing - edge cases

------------------------------------------------------------------------

# 4. Dependency Rules

Dependency tidak menggantikan priority.

Model:

``` text
Priority
   ↓
Dependency validation
   ↓
Timeline placement
```

Contoh:

``` text
Dependency = —
Dependency = Task #07
Dependency = Task #11, #15
```

Jika task memiliki dependency, prerequisite harus diperhatikan sebelum
task tersebut masuk timeline.

`High Impact + Low Effort` tidak boleh dipaksa masuk lebih awal jika
prerequisite belum selesai.

------------------------------------------------------------------------

# 5. Backlog & Readiness

Backlog bukan berarti otomatis Low Impact.

Backlog berarti task **belum ready untuk dijadwalkan**.

Alasan: - PRD belum tersedia - assessment belum selesai - dependency
belum selesai - requirement belum final - external party belum
tersedia - testing environment belum tersedia - scope belum jelas

## Feature readiness gate

Feature baru tidak boleh langsung diberi timeline:

``` text
Feature
 ↓
Assessment / Discovery
 ↓
PRD / Scope
 ↓
Task Breakdown
 ↓
Effort / Impact / Testing
 ↓
Dependency
 ↓
Priority
 ↓
Timeline
```

Jangan mengarang nilai untuk task yang scope-nya belum cukup jelas.

------------------------------------------------------------------------

# 6. Timeline

Kode:

  Code   Meaning
  ------ -----------
  S      September
  O      October
  N      November
  D      December
  B      Backlog

Kode ini juga tercantum di sheet. fileciteturn0file0L18-L22

Timeline:

``` text
Timeline =
Priority
+
Dependency
+
Current Task Constraint
+
Readiness
```

Semakin kecil Impact dan semakin tinggi Effort, semakin akhir task
ditempatkan.

------------------------------------------------------------------------

# 7. Current Tasks --- Start Now

Task berikut adalah current task dan harus dikerjakan mulai sekarang:

1.  Super admin internal
2.  GTM
3.  Demo database and dashboard
4.  Notification service improvement
5.  Advance exporting
6.  Email summary
7.  Fraud dashboard

Sheet awal juga menempatkan task-task tersebut sebagai CURRENT TASK.
fileciteturn0file0L11-L17

Current task harus berada di depan task lain dalam roadmap, kecuali ada
blocker/dependency nyata.

------------------------------------------------------------------------

# 8. Current Task Requirements

## 8.1 Super Admin Internal

Halaman superadmin yang hanya dapat diakses tim internal.

Scope: - approval pendaftaran di SatuInbox - internal administration

GTM merupakan bagian dari superadmin internal.

## 8.2 GTM

Bagian dari Super Admin Internal.

Scope: - statistik Google Ads - analisis Google Ads - internal dashboard

## 8.3 Demo Database and Dashboard

Berisi data kandidat user yang request demo aplikasi SatuInbox.

Scope: - data kandidat demo - dashboard data kandidat - kebutuhan
internal untuk melihat/mengelola request demo

## 8.4 Notification Service Improvement

Improve notification feature existing.

Tujuan: \> Penerimaan notification tepat sasaran kepada user yang
seharusnya menerima notification.

Fokus: - notification targeting - delivery correctness - recipient
correctness - improvement notification service

## 8.5 Advance Exporting

Export data statistik secara dinamis sesuai data yang dimiliki
SatuInbox.

User dapat: - memilih data yang dibutuhkan - export sesuai kebutuhan -
menggunakan data yang tersedia secara dinamis

## 8.6 Email Summary

Current task.

**Scope belum cukup didefinisikan.**

Jangan mengasumsikan: - penerima - frekuensi - isi summary - trigger -
format - data source

sebelum requirement tersedia.

## 8.7 Fraud Dashboard

Scope: - pengiriman invoice fraud - integrasi Lincah App - data customer
fraud dari Lincah - data penagihan dari Lincah - SatuInbox mengirim
invoice melalui Broadcast - dashboard statistik customer yang sudah
di-broadcast - data/status fraud

Status: \> Final requirement masih menunggu user fraud dan Lincah.

------------------------------------------------------------------------

# 9. Remaining Task Requirements

## DB Topology

Current MongoDB: - replica set `rs0` - 3 pod: mongodb-0 PRIMARY,
mongodb-1 SECONDARY, mongodb-2 SECONDARY - MongoDB 8.0.20 Community -
WiredTiger - WT cache 9GiB - EBS gp3 200GiB data + 50GiB mongot-data per
pod - sidecar `mongot` - Atlas Search self-hosted

Target:

**HOT: 0--3 bulan** - collection saat ini - full index - in-memory

**WARM: 4--6 bulan** - collection terpisah / partitioned - partial index

**COLD: ≥7 bulan** - archive - export S3 atau collection tanpa index

Primary scope: - conversation-service - ticket-service

Business problem: - full-retention data terus tumbuh - storage footprint
meningkat - WiredTiger cache pressure meningkat - infra cost meningkat -
query data lama menurunkan performa hot working set

Tujuan: \> Memisahkan workload panas dan dingin tanpa kehilangan akses
histori.

Termasuk: - exclude conversation group - collection atau DB terpisah
masih belum diputuskan

## Infra Redesign and Stability

Improvement infrastructure SatuInbox.

Current condition: \> SatuInbox belum dapat dikatakan stabil dan score
stabilitas sekitar 50%.

Tujuan: - reliability - stability - infrastructure foundation

Dependency harus diperiksa sebelum task yang bergantung pada
infrastructure.

## UI Conversation Redesign

Audit ulang UI/UX conversation: - kenyamanan user - placement button -
placement section - bagian yang perlu langsung ditampilkan - bagian yang
dapat disembunyikan - user workflow - responsive - seluruh viewport

## Simplicity Settings

Membuat Settings lebih simple dan mudah dimengerti.

Pertimbangan: - user comfort - user journey - information architecture -
guidance - clarity - UI redesign

## Ticketing KPI Card and Dynamic Status

Improvement UI halaman utama Ticket.

Target: - KPI card - KPI mencerminkan keadaan ticket - status dapat
di-setup dinamis oleh user - KPI mengikuti status yang dikonfigurasi
user

## Informative Utilities

Menambahkan deskripsi/penjelasan pada fitur penting agar user tidak
bingung.

Termasuk message utility yang jelas di conversation, misalnya: - channel
account disconnect - penggantian nomor - kondisi lain yang membuat
conversation tidak dapat digunakan

## Wizard Setting Onboarding

Quick guide saat user pertama kali mengakses halaman/fitur.

Rule: - muncul satu kali - P1: dapat diulang jika user meminta guide
ulang

## Sales Module

Improvement Sales Module existing: - UI - workflow - user experience

## Create Prospect from Conversation

Interconnection Conversation → Sales.

Flow:

``` text
Conversation
 ↓
User menilai conversation sebagai prospect
 ↓
Create Prospect
 ↓
Sales Module
```

## Widget Module

Improvement: - UI/UX - workflow - domain-specific configuration -
workflow spesifik per widget

## Cost Simulation WA Official and Guarding

Menampilkan used cost pada conversation dengan WhatsApp Official.

Termasuk: - used cost visibility - budget awareness - guarding agar user
tidak overbudget

## Grouping Contact

Problem: contact saat ini terpisah berdasarkan channel.

Contoh:

``` text
WhatsApp → Arif
Email → Arif
Instagram → Arif
```

Target:

``` text
Arif = 1 contact
       ├─ WhatsApp
       ├─ Email
       ├─ Instagram
       └─ channel lain
```

Tujuan: \> Satu contact dapat digunakan lintas seluruh channel
SatuInbox.

## WA Official Adjustment Research

Research perubahan API Meta untuk WhatsApp.

Pertanyaan: \> Apakah ada perubahan API Meta yang membuat user membayar
setiap message yang dikirim atau diterima?

Ini adalah research/assessment.

## Chat Bot Auto Response

AI agent merespons chat pelanggan tanpa human agent.

Flow:

``` text
Customer
 ↓
Conversation
 ↓
AI Agent
 ↓
Response
 ↓
Escalate → Human Agent jika dibutuhkan
```

## Conversation AI Summary

AI Agent memberikan summary singkat isi conversation.

Dependency terhadap AI agent harus dinilai dari architecture, bukan
diasumsikan.

## Chat Tools API

Integrasi pihak ketiga yang membutuhkan communication layer.

Scope detail membutuhkan assessment API contract dan integration
requirements.

## Widget App

Web app/mobile dan mobile app yang mudah digunakan.

Konsep authentication: - Google Login

Scope final membutuhkan assessment.

## Telegram

Telegram sebagai channel baru.

Status: \> Development sempat pending.

## Shopee Chat

Shopee sebagai source channel chat baru.

Status: \> Pending, menunggu seller yang bersedia menjadi akun testing.

External testing dependency harus diperhitungkan.

## TikTok Chat

TikTok sebagai source channel chat baru.

Status: \> Source channel chat baru.

## FAQ

Menambahkan halaman FAQ di dalam SatuInbox App.

Current: \> FAQ hanya tersedia di landing page.

Target: \> FAQ tersedia di dalam aplikasi.

------------------------------------------------------------------------

# 10. Visual --- Big Picture

## Style

Modern enterprise SaaS strategy dashboard: - clean white/off-white
canvas - Inter font - navy typography - SatuInbox blue - pastel semantic
colors - rounded cards - thin gray borders - subtle shadows - horizontal
widescreen layout - clear information hierarchy

## Layout

``` text
┌──────────────────────────────────────────────────────────────┐
│ SatuInbox       Big Picture                       Tagline     │
├─────────────┬──────────────────┬──────────────┬─────────────┤
│ Omnichannel │ SatuInbox        │ Product      │ Business    │
│ Channels    │ Platform         │ Modules      │ Value       │
│             │                  │              │             │
│ Widget      │ Unified Inbox    │ Chat         │ Customers   │
│ WA Official │ Manage           │ Ticket       │ Agents      │
│ WA Web      │ Automate         │ Sales        │ Supervisors │
│ Instagram   │ Secure           │ Broadcast    │ Owners      │
│ Facebook    │ Scalable         │ Analytics    │             │
│ Email       │ Customizable     │ AI           │             │
│ TikTok      │                  │ Tools        │             │
│ Shopee      │                  │ Payment      │             │
│ API         │                  │ Mobile       │             │
├─────────────┴──────────────────┴──────────────┴─────────────┤
│ Strategic Areas & Recommendations                            │
└──────────────────────────────────────────────────────────────┘
```

## Color system

``` css
--brand: #2563EB;
--brand-dark: #172554;
--bg: #F8FAFC;
--surface: #FFFFFF;
--border: #E2E8F0;
--text: #172554;
--muted: #64748B;

--blue-soft: #EFF6FF;
--green-soft: #ECFDF5;
--purple-soft: #F5F3FF;
--orange-soft: #FFF7ED;
--pink-soft: #FDF2F8;
```

## Font

``` css
font-family: "Inter", "Segoe UI", Arial, sans-serif;
```

Typography: - title: 34--40px / 700 - section: 20--24px / 700 - card:
14--16px / 600 - body: 12--14px / 400 - caption: 11--12px / 400

------------------------------------------------------------------------

# 11. Visual --- Task Prioritization & Timeline

## Style

Modern enterprise SaaS product roadmap dashboard: - light background -
dense but readable table - pastel semantic colors - rounded cards -
compact badges - soft Gantt bars - strong hierarchy - responsive

## Layout

``` text
┌──────────────────────────────────────────────────────────────────┐
│ SatuInbox       Product Task Prioritization & Roadmap            │
├────────┬────────┬────────┬────────┬──────────────────────────────┤
│ Tasks  │ Current│ P1     │ P2     │ P3                           │
├──────────────────────────────────────────────────────────────────┤
│ Priority Rule                │ Timeline Codes                    │
├──────────────────────────────────────────────────────────────────┤
│ # │ Task │ Area │ I │ E │ T │ Dependency │ P │ S O N D │ B │
├──────────────────────────────────────────────────────────────────┤
│ CURRENT TASKS                                                    │
├──────────────────────────────────────────────────────────────────┤
│ NEXT PRIORITIES                                                  │
├──────────────────────────────────────────────────────────────────┤
│ LATER / BACKLOG                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Required columns

-   # 

-   Task

-   Strategic Area

-   Description

-   Impact

-   Effort

-   Testing

-   Dependency

-   Priority

-   September

-   October

-   November

-   December

-   Backlog

## Priority colors

``` css
P1:
background: #DCFCE7;
color: #15803D;

P2:
background: #DBEAFE;
color: #2563EB;

P3:
background: #EDE9FE;
color: #7C3AED;

Backlog:
background: #FFEDD5;
color: #C2410C;
```

Gantt: - P1 = `#34D399` - P2 = `#60A5FA` - P3 = `#A78BFA` - Backlog =
`#FB923C`

## Effort / Impact / Testing

Use compact pills:

``` html
<span class="metric metric-high">H</span>
<span class="metric metric-medium">M</span>
<span class="metric metric-low">L</span>
```

Semantic colors: - H = pale red - M = pale blue - L = pale green

H/M/L labels must remain visible even when color is used.

------------------------------------------------------------------------

# 12. Recommended HTML --- Big Picture

``` html
<div class="page">

  <header class="header">
    <div class="brand">SatuInbox</div>

    <div>
      <h1>Big Picture</h1>
      <p>Omnichannel Chat Platform to Grow Your Business</p>
    </div>
  </header>

  <main class="architecture">

    <section class="panel channels">
      <!-- Omnichannel channels -->
    </section>

    <section class="panel platform">
      <!-- SatuInbox Platform -->
    </section>

    <section class="panel modules">
      <!-- Product Modules -->
    </section>

    <section class="panel value">
      <!-- Business Value -->
    </section>

  </main>

  <section class="strategic-areas">
    <!-- Strategic Areas -->
  </section>

</div>
```

------------------------------------------------------------------------

# 13. Recommended HTML --- Timeline

``` html
<div class="roadmap">

  <header class="roadmap-header">
    <div class="brand">SatuInbox</div>

    <div>
      <h1>Product Task Prioritization & Roadmap</h1>
      <p>From current priorities to long-term growth</p>
    </div>
  </header>

  <section class="summary">
    <!-- Total Tasks -->
    <!-- Current Tasks -->
    <!-- P1 -->
    <!-- P2 -->
    <!-- P3 -->
  </section>

  <section class="rule-panel">
    <!-- Impact → Effort → Testing -->
    <!-- Dependency -->
    <!-- Timeline codes -->
  </section>

  <table class="task-table">

    <thead>
      <tr>
        <th>#</th>
        <th>Task</th>
        <th>Strategic Area</th>
        <th>Impact</th>
        <th>Effort</th>
        <th>Testing</th>
        <th>Dependency</th>
        <th>Priority</th>
        <th>Sep</th>
        <th>Oct</th>
        <th>Nov</th>
        <th>Dec</th>
        <th>Backlog</th>
      </tr>
    </thead>

    <tbody>
      <!-- Current Tasks -->
      <!-- Next Priorities -->
      <!-- Later -->
    </tbody>

  </table>

</div>
```

------------------------------------------------------------------------

# 14. UX Principle

## Big Picture

Menjawab:

> **What is SatuInbox?**

``` text
OMNICHANNEL
→ PLATFORM
→ PRODUCT
→ VALUE
```

## Timeline

Menjawab:

> **What should SatuInbox work on next, and why?**

``` text
CURRENT TASK
→ IMPACT
→ EFFORT
→ TESTING
→ DEPENDENCY
→ PRIORITY
→ TIMELINE
```

------------------------------------------------------------------------

# 15. Non-Assumption Rule

Jika judul task belum cukup jelas, **jangan membuat interpretasi
sendiri**.

Tandai:

`NEEDS DESCRIPTION`

Jangan memberikan nilai definitive untuk: - effort - impact - testing -
dependency - priority - timeline

sampai requirement cukup jelas.

Task yang membutuhkan klarifikasi/assessment bila belum tersedia: -
Email summary - Sales module - Widget module - Infra redesign +
stability - DB topology detail - Chat tools API - Widget app - TikTok
chat - feature baru lainnya

------------------------------------------------------------------------

# 16. Final Decision Model

``` text
             IMPACT
                ↓
             EFFORT
                ↓
             TESTING
                ↓
          DEPENDENCY CHECK
                ↓
          READINESS CHECK
                ↓
             TIMELINE
```

Final principle:

> High-impact work should dominate the roadmap, but high-impact work
> should not bypass readiness and dependency checks.

------------------------------------------------------------------------

# 17. Source Notes

Spreadsheet awal memuat kategori BACKLOG, CURRENT TASK, FEATURE, UI/UX,
effort, impact, testing, dan TIME. fileciteturn0file0L10-L22

Daftar strategic recommendation pada sheet: Analytics, Open API,
Broadcast, Omnichannel Chat, Ticket, Sales, Tools / Add-ons, AI, Theme,
Affiliate, Payment, Notification, dan Mobile App.
fileciteturn0file0L23-L36

Task yang tercantum pada sheet mencakup current task, backlog, feature,
dan UI/UX; requirement detail pada dokumen ini mengikuti klarifikasi
yang diberikan setelahnya. fileciteturn0file0L11-L17
