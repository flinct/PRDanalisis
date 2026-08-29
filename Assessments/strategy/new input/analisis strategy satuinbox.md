Saya sudah baca tiga technical reference SatuInbox — FE, BE, dan mobile — lalu saya bandingkan dengan arah produk pemain seperti Zendesk, Intercom, Gorgias, respond.io, SleekFlow, Barantum, dan Mekari Qontak, termasuk positioning calon client JNE serta existing client SAPX, Lion Parcel, dan Lincah.

Kesimpulan saya cukup kuat:

> **SatuInbox sebaiknya jangan kembali menjadi “omnichannel platform” generik.**

> **Arah yang lebih kuat: menjadi Customer Operations Platform untuk perusahaan dengan volume customer conversation tinggi — terutama Logistics, Delivery, E-commerce dan bisnis yang operasionalnya sangat bergantung pada WhatsApp.**

Dan menurut saya, **SAPX → Lion Parcel → Lincah → JNE bukan sekadar kebetulan client. Itu sudah memberi SatuInbox vertical signal yang sangat kuat.**

---

# **1\. Saya mulai dari kondisi SatuInbox sekarang**

Secara teknis, SatuInbox sudah jauh lebih besar daripada sekadar omnichannel inbox.

Backend saat ini sudah punya domain:

* Conversation  
* Ticket  
* SLA  
* CSAT  
* Analytics  
* Broadcast  
* WhatsApp Web  
* WhatsApp Business API  
* Instagram  
* Messenger  
* Email  
* Live Chat Widget  
* Contacts  
* Leads  
* Sales / Visit  
* Payment  
* Notification  
* Audit  
* Webhook / Open API  
* Shipping credentials  
* Contact sync

Backend bahkan sudah terdiri dari **20 service**, termasuk `conversation-service`, `ticket-service`, `analytics-service`, `broadcast-service`, `sales-service`, dan channel-specific services.

FE-nya juga sudah bukan sekadar chat:

* Conversation  
* Ticketing  
* SLA  
* Broadcast  
* Leads  
* Contacts  
* Statistics  
* Notification  
* WhatsApp management  
* Webhook  
* Shipping credentials  
* Contact sync  
* Billing  
* Roles/RBAC  
* Widget

Mobile bahkan sudah punya **Visits \+ Leads \+ Check-in**, sehingga SatuInbox mulai masuk ke workflow operasional lapangan.

Jadi masalahnya **bukan kekurangan fitur**.

Masalah yang mulai muncul justru:

> **SatuInbox berpotensi menjadi terlalu banyak hal sekaligus.**

---

# **2\. Ini bahaya terbesar SatuInbox sekarang**

Kalau tidak dikontrol, roadmap bisa berubah menjadi:

Omnichannel  
  ↓  
CRM  
  ↓  
Ticketing  
  ↓  
Sales  
  ↓  
Marketing  
  ↓  
AI  
  ↓  
CDP  
  ↓  
Call Center  
  ↓  
Field Sales  
  ↓  
Payment  
  ↓  
ERP  
  ↓  
???

Dan akhirnya SatuInbox menjadi:

> "software yang punya banyak fitur"

daripada:

> "software yang menyelesaikan satu masalah bisnis dengan sangat baik."

Ini adalah risiko yang cukup serius karena kompetitor sudah bermain di breadth.

---

# **3\. Pasarnya sendiri sedang bergerak ke mana?**

Saya menemukan pola yang sangat konsisten.

### **Zendesk**

Zendesk bergerak dari:

**Helpdesk → Customer Service Platform → AI Customer Operations**

Mereka bahkan sudah mengembangkan **AI predictive routing**, yang memprediksi agent mana yang dapat menyelesaikan ticket paling cepat berdasarkan workload dan konteks ticket.

Omnichannel routing mereka juga sudah mempertimbangkan:

* availability  
* capacity  
* SLA  
* priority  
* skills

---

### **Intercom**

Intercom juga sudah tidak menjual:

> "shared inbox"

saja.

Mereka menggabungkan:

**Inbox \+ Workflow \+ AI Agent \+ Copilot \+ Ticketing \+ Reporting**

AI-nya bukan sekadar chatbot.

Fin dapat menyelesaikan conversation, sementara Copilot membantu agent.

---

### **Gorgias**

Lebih menarik lagi.

Gorgias sangat vertical:

> **E-commerce customer service**

AI Agent mereka dapat:

* menjawab customer  
* membantu pembelian  
* order inquiry  
* return  
* order change  
* shipping  
* bahkan melakukan action ke sistem lain.

Mereka bahkan punya **Shopping Assistant** khusus pre-sales.

Ini contoh bagus:

> Mereka tidak berusaha menjadi "CRM untuk semua perusahaan".

Mereka memilih **customer conversation untuk e-commerce**.

---

# **4\. Respond.io menunjukkan arah lain**

respond.io juga menarik karena mereka menjual:

> **Customer Conversation Management**

bukan sekadar omnichannel.

Mereka menggabungkan:

WhatsApp  
Instagram  
Facebook  
Telegram  
Email  
Live Chat  
Voice  
      ↓  
Unified Inbox  
      ↓  
CRM  
      ↓  
AI Agent  
      ↓  
Workflow  
      ↓  
Action

Dan AI Agent mereka sekarang dapat melakukan action seperti:

* assign conversation  
* close conversation  
* update contact  
* update lifecycle  
* routing

Bahkan AI Agent dapat memanggil workflow untuk menjalankan business logic.

---

# **5\. Kompetitor Indonesia bahkan lebih agresif**

Contohnya Barantum.

Mereka sudah menjual:

* CRM  
* Omnichannel  
* Call Center  
* WhatsApp API  
* AI Agent  
* Chatbot  
* Lead scoring  
* Sales pipeline  
* Auto distribution  
* Live Chat  
* Voice  
* IVR  
* Predictive Dialer

Mereka bahkan memiliki positioning berdasarkan industri.

Misalnya:

* Haji/Umrah  
* Klinik  
* Pendidikan  
* Dealer  
* ISP  
* Retail/e-commerce

Jadi kalau SatuInbox mencoba:

> "Kami juga punya CRM, chatbot, call center, marketing, AI, dll."

maka **SatuInbox masuk ke perang breadth**.

Itu perang yang mahal.

---

# **6\. Mekari Qontak bahkan lebih jelas lagi**

Qontak saat ini positioning-nya sudah:

Omnichannel  
\+  
CRM  
\+  
Sales  
\+  
Customer Service  
\+  
AI  
\+  
Marketing  
\+  
CDP  
\+  
Automation

Mereka mengklaim telah digunakan oleh puluhan ribu bisnis di regional dan memiliki AI Agent yang dapat mengeksekusi pekerjaan bisnis.

Mereka juga secara eksplisit punya solusi untuk **logistics**.

Jadi:

> **jangan mencoba mengalahkan Qontak dengan jumlah fitur.**

---

# **7\. Tapi ada sesuatu yang sangat menarik dari client SatuInbox**

Sekarang kita lihat client yang Anda berikan.

### **SAPX**

SAPX mempunyai:

* Corporate  
* Online Seller  
* Perorangan  
* Last Mile  
* Fulfillment  
* Warehouse  
* International  
* COD

Dan customer service mereka menggunakan:

* WhatsApp  
* Live Chat  
* Email  
* Phone

---

### **Lion Parcel**

Core business:

> logistics / delivery.

---

### **Lincah**

Core business:

> logistics / delivery / operational communication.

---

### **JNE**

Dan calon terbesar berikutnya:

JNE memiliki customer ecosystem yang sangat besar dan sudah mempunyai:

* MyJNE  
* customer service  
* telephone  
* email  
* berbagai layanan customer-facing

---

# **8\. Jadi vertical signal SatuInbox sebenarnya sudah kelihatan**

Kalau saya lihat dari luar:

SAPX  
 │  
 ├── logistics  
 │  
Lion Parcel  
 │  
 ├── logistics  
 │  
Lincah  
 │  
 ├── logistics  
 │  
JNE  
 │  
 └── logistics

Ditambah kemampuan SatuInbox:

WhatsApp  
Instagram  
Messenger  
Email  
Live Chat  
Ticket  
SLA  
Assignment  
Analytics  
Broadcast  
Contact  
Lead  
Visit  
Shipping  
Webhook  
API

Ini sangat cocok untuk:

# **High-volume operational customer communication**

Dan vertical paling natural-nya:

# **Logistics / Delivery / E-commerce**

---

# **9\. Saya akan mengubah definisi produk SatuInbox**

Bukan:

> Omnichannel CRM

Bukan:

> WhatsApp CRM

Bukan juga:

> Customer Service Software

Saya lebih menyukai:

# **Customer Operations Platform**

atau lebih spesifik:

# **Customer Operations Platform for High-Volume Businesses**

Contohnya:

> **SatuInbox helps high-volume businesses turn customer conversations into structured operational workflows.**

Bahasa sederhananya:

> **Semua chat pelanggan masuk → dipahami → diarahkan → dikerjakan → dipantau → diselesaikan.**

---

# **10\. Core Product Loop SatuInbox**

Menurut saya seluruh product harus dibangun mengelilingi loop ini:

CUSTOMER  
  │  
  ▼  
Conversation  
  │  
  ▼  
Understand Intent  
  │  
  ▼  
Route / Assign  
  │  
  ▼  
Ticket / Workflow  
  │  
  ▼  
Agent / AI  
  │  
  ▼  
SLA  
  │  
  ▼  
Resolution  
  │  
  ▼  
Customer Feedback  
  │  
  ▼  
Analytics  
  │  
  └───────────────┐  
                  ▼  
            Improve Workflow

Ini jauh lebih kuat daripada:

WhatsApp  
Instagram  
Email  
Facebook  
Telegram  
...

Karena **channel bukan core value**.

Channel hanya pintu masuk.

---

# **11\. Ini juga mengubah cara kita melihat omnichannel**

Saya justru tidak akan membuang omnichannel.

Tetapi mengubah hierarchy-nya.

### **Sekarang secara mental:**

SatuInbox  
  ↓  
Omnichannel  
  ↓  
WhatsApp  
Instagram  
Email  
Messenger

### **Seharusnya:**

SatuInbox  
  ↓  
Customer Operations  
  ↓  
Conversation  
  ↓  
Workflow  
  ↓  
Resolution  
  ↓  
SLA / Analytics / AI  
  ↓  
Channels

Dengan demikian:

> WhatsApp bukan produk SatuInbox.

> WhatsApp adalah salah satu entry point ke SatuInbox.

---

# **12\. Target user yang saya rekomendasikan**

Saya tidak akan target:

> "semua bisnis yang menggunakan WhatsApp."

Terlalu luas.

Saya akan membagi market menjadi:

### **Tier 1 — Primary ICP**

**Enterprise / upper-mid market dengan customer conversation volume tinggi.**

Terutama:

1. Logistics  
2. Courier  
3. Delivery  
4. E-commerce  
5. Marketplace  
6. Retail chain  
7. Fulfillment  
8. Travel  
9. Financial services  
10. Healthcare

Tetapi **Logistics \+ Delivery \+ E-commerce** menjadi beachhead.

---

# **13\. Kenapa logistics sangat cocok?**

Karena problem customer service mereka sangat predictable.

Customer bertanya:

Paket saya dimana?  
Kenapa belum sampai?  
Bisa ubah alamat?  
Kurir belum datang.  
Barang rusak.  
Barang hilang.  
COD bagaimana?  
Berapa ongkir?  
Kapan pickup?  
Kenapa status tidak berubah?

Semua ini menghasilkan:

> **structured customer intents**

Dan ini sangat cocok dengan AI.

Misalnya:

Customer:  
"Paket saya belum sampai."

       ↓

AI

Intent:  
Shipment Delay

       ↓

Entity extraction:  
AWB \= JP123456789

       ↓

API Shipping System

       ↓

Status:  
Out for Delivery

       ↓

AI

"Pesanan Anda sedang dibawa kurir  
dan diperkirakan tiba hari ini."

       ↓

NO HUMAN AGENT

Kalau status:

Lost / Exception

maka:

AI  
↓  
Create Ticket  
↓  
Priority High  
↓  
Assign Escalation Team  
↓  
SLA 30 min

**Ini jauh lebih valuable daripada sekadar chatbot.**

# **14\. Inilah peluang terbesar SatuInbox**

Saya menyebutnya:

# **Conversation → Action**

Bukan:

# **Conversation → Reply**

Pasar sudah bergerak ke sana.

Zendesk AI agent dapat melakukan tindakan.

Gorgias AI dapat melakukan actions terhadap sistem eksternal.

respond.io AI dapat menjalankan workflows.

Qontak juga sudah mengarah ke AI yang dapat mengeksekusi pekerjaan bisnis.

Jadi kalau SatuInbox hanya membuat:

> "AI Chatbot yang menjawab customer"

itu **terlambat**.

---

# **15\. AI SatuInbox harus seperti ini**

Saya akan membangun:

# **SatuInbox AI Operations Agent**

Bukan chatbot.

Arsitekturnya:

                   Customer  
                      │  
                      ▼  
                SatuInbox Inbox  
                      │  
                      ▼  
                 AI Intent  
                      │  
         ┌────────────┼────────────┐  
         ▼            ▼            ▼  
      Answer       Action        Human  
         │            │            │  
         │            ▼            │  
         │      External API       │  
         │            │            │  
         │     ┌──────┴──────┐     │  
         │     ▼             ▼     │  
         │   Shipping       CRM    │  
         │   Payment        ERP    │  
         │                   │     │  
         └──────────┬────────┘     │  
                    ▼              ▼  
                Resolution      Escalation  
                    │              │  
                    └──────┬───────┘  
                           ▼  
                         SLA  
                           ▼  
                       Analytics  
---

# **16\. Contoh khusus JNE/SAPX/Lion**

Misalnya:

### **Case 1**

> "Paket saya dimana?"

AI:

Identify AWB  
      ↓  
Shipping API  
      ↓  
Tracking  
      ↓  
Answer  
---

### **Case 2**

> "Paket saya rusak."

AI:

Intent \= Damage Claim

      ↓

Collect:  
\- AWB  
\- photo  
\- description

      ↓

Create Ticket

      ↓

Priority \= High

      ↓

Assign Claim Team

      ↓

SLA  
---

### **Case 3**

> "Saya mau pickup."

AI:

Intent \= Pickup Request

      ↓

Collect address  
      ↓  
Check service area  
      ↓  
Create pickup  
      ↓  
Confirmation  
---

### **Case 4**

> "Saya sudah bayar tapi status masih COD."

AI:

Intent \= Payment Issue

      ↓

Payment API

      ↓

Verify transaction

      ↓  
      ├── valid → update  
      └── invalid → ticket  
---

# **17\. Ini membuat positioning SatuInbox jauh lebih kuat**

Daripada:

> "Omnichannel platform."

Menjadi:

> **"SatuInbox turns customer conversations into business actions."**

Atau untuk vertical logistics:

> **"The customer operations platform for logistics and delivery companies."**

Itu jauh lebih mudah dijual.

---

# **18\. Lalu bagaimana dengan fitur existing?**

Justru banyak fitur yang sekarang sudah dibuat menjadi masuk akal.

| Existing | Peran baru |
| ----- | ----- |
| WhatsApp | Entry point |
| Instagram | Entry point |
| Messenger | Entry point |
| Email | Entry point |
| Live Chat | Entry point |
| Conversation | Core |
| Ticket | Operational work |
| Assignment | Routing |
| SLA | Service control |
| Analytics | Operational intelligence |
| Broadcast | Proactive communication |
| Contacts | Customer context |
| Leads | Commercial context |
| Visits | Field operation |
| Webhook | System integration |
| Open API | Business action |
| Shipping credentials | Vertical integration |
| AI | Decision \+ execution |

Jadi bukan banyak fitur yang dibuang.

**Hierarchy-nya yang diubah.**

---

# **19\. Saya justru melihat `shipping-credentials` sangat penting**

Di backend sudah ada:

> `shipping-credentials`

dan service `sales-service`, contact, API, webhook, dll.

Ini bisa menjadi awal verticalization.

Bayangkan:

### **SatuInbox Logistics Integration**

SatuInbox  
    │  
    ├── Shipment API  
    ├── Order API  
    ├── Payment API  
    ├── Customer API  
    ├── Warehouse API  
    └── CRM API

Kemudian AI dapat memanggil API tersebut.

---

# **20\. Maka moat SatuInbox bukan chatbot**

Ini penting.

Kalau SatuInbox membuat chatbot:

> kompetitor bisa membuat chatbot.

Kalau SatuInbox membuat:

> AI yang terintegrasi dengan workflow operasional perusahaan

lebih sulit ditiru.

Moat-nya menjadi:

Conversation Data  
      \+  
Customer Context  
      \+  
Business Workflow  
      \+  
SLA  
      \+  
Integrations  
      \+  
Operational History  
      \+  
AI

Semakin lama digunakan:

> semakin memahami operasi perusahaan.

---

# **21\. Saya akan membagi product menjadi 4 layer**

## **Layer 1 — Conversation**

WhatsApp  
Instagram  
Messenger  
Email  
Live Chat

Ini **foundation**, bukan differentiation.

---

## **Layer 2 — Customer Operations**

Inbox  
Assignment  
Ticket  
Workflow  
SLA  
Escalation  
CSAT

Ini core product.

---

## **Layer 3 — Intelligence**

AI Agent  
Intent Classification  
Conversation Summary  
Sentiment  
Priority Prediction  
Predictive Routing  
Agent Copilot  
QA / Conversation Scoring

Ini future differentiation.

---

## **Layer 4 — Execution**

Shipping API  
CRM  
ERP  
Payment  
Order  
Warehouse  
Ticket creation  
Refund  
Reschedule  
Pickup  
Notification

Ini yang membuat SatuInbox menjadi **operational platform**.

---

# **22\. Dan saya akan membuat satu north-star metric**

Bukan:

* jumlah chat  
* jumlah agent  
* jumlah channel  
* jumlah ticket

Tetapi:

# **Resolution Rate Without Human Intervention**

atau lebih lengkap:

> **% customer intents successfully resolved by SatuInbox without human intervention.**

Contoh:

100.000 conversations

40.000  
↓  
AI resolved

30.000  
↓  
AI \+ API action

20.000  
↓  
Agent assisted

10.000  
↓  
Human only

Target:

AI \+ Automation Resolution  
       ↑  
       │  
     20%  
       │  
     40%  
       │  
     60%  
       │  
     80%

Ini jauh lebih strategis daripada sekadar:

> "jumlah conversation meningkat."

---

# **23\. Product roadmap saya kalau menjadi Product Lead SatuInbox**

Saya akan membuat **3 horizon**.

---

## **HORIZON 1 — 0–6 bulan**

### **Jangan tambah banyak domain.**

Fokus:

# **Operational Excellence**

Perkuat:

### **Conversation**

* global search  
* advanced filtering  
* conversation context  
* customer profile  
* related tickets  
* conversation history

### **Routing**

* skill-based routing  
* workload routing  
* SLA-based routing  
* priority routing  
* auto assignment

Zendesk sekarang justru bergerak ke predictive routing berdasarkan estimated resolution time.

### **Ticket**

* conversation → ticket  
* ticket → conversation  
* ticket relationship  
* escalation  
* SLA  
* workflow

### **Supervisor**

* SLA breach prediction  
* workload  
* queue health  
* agent performance  
* unresolved conversations

---

# **24\. Horizon 2 — 6–12 bulan**

# **AI Agent**

Bukan chatbot builder yang kompleks.

Mulai dengan vertical use case.

### **Logistics AI Agent**

Contoh intent:

TRACKING  
DELIVERY\_DELAY  
PICKUP  
ADDRESS\_CHANGE  
CANCEL\_ORDER  
COD  
PAYMENT  
COMPLAINT  
DAMAGED\_PACKAGE  
LOST\_PACKAGE  
RESCHEDULE

AI kemudian:

Understand  
  ↓  
Retrieve  
  ↓  
Action  
  ↓  
Resolve  
---

# **25\. Horizon 3 — 12–24 bulan**

Baru masuk ke:

# **Customer Operations Intelligence**

Contohnya:

> "SatuInbox menemukan bahwa 18% customer complaint berasal dari delay pada hub Bandung."

atau:

> "CSAT turun 11% pada conversation yang mengalami assignment \>10 menit."

atau:

> "80% pertanyaan customer sebenarnya dapat diselesaikan tanpa agent."

atau:

> "Agent A menangani 2.3x lebih banyak escalation daripada agent lain."

AI bukan hanya menjawab customer.

AI mulai menjawab:

> **"Apa yang sedang terjadi di customer operation perusahaan saya?"**

Ini level yang jauh lebih tinggi.

---

# **26\. Apa yang sebaiknya JANGAN dilakukan**

Ini bagian yang menurut saya paling penting untuk mencegah development melebar.

### **Jangan buru-buru:**

❌ Payroll  
 ❌ HR  
 ❌ Accounting  
 ❌ Full ERP  
 ❌ Full CRM seperti Salesforce  
 ❌ Full marketing automation  
 ❌ Full call-center suite  
 ❌ Warehouse management  
 ❌ Inventory management  
 ❌ Marketplace management  
 ❌ Full CDP  
 ❌ Project management  
 ❌ Generic workflow platform

Walaupun semuanya "bisa diintegrasikan".

# **27\. Sales juga jangan menjual semua fitur**

Saya akan ubah sales pitch.

Jangan:

> "SatuInbox memiliki WhatsApp, Instagram, Email, Ticketing, Broadcast, CRM, Leads, Analytics..."

Itu feature selling.

Gunakan:

# **Problem selling**

Contoh untuk logistics:

> "Berapa banyak customer service agent yang Anda punya?"

> "Berapa banyak conversation masuk per hari?"

> "Berapa persen customer menanyakan tracking?"

> "Berapa lama rata-rata customer menunggu?"

> "Berapa banyak complaint yang harus dieskalasi?"

> "Apakah agent harus membuka sistem lain untuk mengecek shipment?"

Kemudian:

> **"SatuInbox menghubungkan conversation customer dengan operational workflow perusahaan."**

Itu lebih enterprise.

---

# **28\. Saya akan membuat vertical package**

Bukan menjual:

> SatuInbox Enterprise.

Tapi:

### **SatuInbox for Logistics**

Kemudian package:

SatuInbox  
│  
├── Logistics  
│  
│   ├── Shipment Tracking  
│   ├── Customer Service  
│   ├── Complaint  
│   ├── Pickup  
│   ├── COD  
│   ├── SLA  
│   ├── AI Agent  
│   └── Operational Analytics  
│  
├── E-commerce  
│  
│   ├── Order  
│   ├── Payment  
│   ├── Return  
│   ├── Shipping  
│   └── Sales  
│  
└── Generic Enterprise

**Logistics menjadi flagship vertical.**

---

# **29\. Marketing juga harus berubah**

Saat ini positioning website SatuInbox sudah mulai mengarah ke:

> "WhatsApp Command Center"

dan menjelaskan problem chat tercecer, owner tidak jelas, follow-up manual, SLA tidak terlihat, dan report sulit dibuat.

Menurut saya ini sudah bagus sebagai **entry-level positioning**, tetapi untuk enterprise perlu naik satu level.

### **Marketing funnel:**

WhatsApp problem  
      ↓  
Team Inbox  
      ↓  
Customer Operations  
      ↓  
Automation  
      ↓  
AI  
      ↓  
Business Integration  
---

# **30\. Landing page untuk logistics misalnya**

Hero:

> **Customer Operations Platform for Logistics**

Subheadline:

> Manage customer conversations, shipment inquiries, complaints, tickets and SLA from one operational workspace.

Kemudian:

WhatsApp  
Instagram  
Email  
Live Chat  
      ↓  
SatuInbox  
      ↓  
AI  
      ↓  
Ticket  
      ↓  
Shipment API  
      ↓  
Resolution

Case study:

> **How SAPX manages customer operations with SatuInbox**

> **How Lion Parcel reduces customer response workload with SatuInbox**

> **How JNE can automate shipment-related customer conversations**

Ini jauh lebih powerful daripada artikel:

> "5 manfaat omnichannel."

---

# **31\. JNE menurut saya harus dijadikan strategic account**

Kalau JNE benar-benar menjadi prospect terdekat, saya **tidak akan menjual SatuInbox sebagai software**.

Saya akan menjual:

# **JNE Customer Operations Transformation**

Proposalnya kira-kira:

Current

Customer  
  ↓  
WhatsApp / Phone / App / Email  
  ↓  
CS Agent  
  ↓  
Manual lookup  
  ↓  
Manual response  
  ↓  
Escalation

versus:

Future

Customer  
  ↓  
Any Channel  
  ↓  
SatuInbox  
  ↓  
Intent Detection  
  ↓  
AI  
  ↓  
JNE API  
  ↓  
Answer / Action  
  ↓  
Ticket if needed  
  ↓  
SLA  
  ↓  
Analytics

JNE punya customer service dan MyJNE sebagai customer-facing ecosystem.

Jadi SatuInbox jangan mencoba menggantikan MyJNE.

**SatuInbox menjadi operational brain di belakang customer interaction.**

---

# **32\. Dan ini penting untuk arsitektur development**

Kalau strategic direction-nya seperti ini, saya akan memberikan rule ke engineering:

> **Every new feature must answer one of four questions.**

### **1\. Does it improve conversation handling?**

Conversation  
Routing  
Assignment  
Search  
Context

### **2\. Does it improve resolution?**

Ticket  
Workflow  
SLA  
AI  
Automation

### **3\. Does it improve operational visibility?**

Analytics  
Reporting  
Supervisor  
QA

### **4\. Does it connect conversation to business action?**

API  
Webhook  
ERP  
CRM  
Shipping  
Payment  
Order

Kalau tidak masuk empat kategori tersebut:

# **jangan masuk roadmap core.**

---

# **33\. Bahkan saya akan membuat Product Filter seperti ini**

Setiap PRD baru wajib mendapatkan score:

| Question | Score |
| ----- | ----- |
| Mempercepat resolution? | 0–5 |
| Mengurangi workload agent? | 0–5 |
| Meningkatkan SLA? | 0–5 |
| Memungkinkan automation/AI? | 0–5 |
| Relevan logistics/e-commerce? | 0–5 |
| Bisa digunakan existing enterprise? | 0–5 |
| Meningkatkan switching cost? | 0–5 |

Misalnya:

### **"WhatsApp group mention"**

Resolution       1  
Agent efficiency  1  
SLA               0  
AI                0  
Logistics         1  
Enterprise        1  
Moat              0

TOTAL \= 4

Low priority.

---

### **"AI shipment tracking"**

Resolution       5  
Agent efficiency 5  
SLA              4  
AI               5  
Logistics        5  
Enterprise       5  
Moat             4

TOTAL \= 33

High priority.

---

# **34\. Dari sisi development, ini juga akan mengurangi sprawl**

Saat ini architecture SatuInbox sudah cukup kompleks:

**20 backend services**, microservices \+ gRPC \+ RabbitMQ \+ MongoDB per service \+ Redis \+ Socket.IO.

Artinya:

> **cost membuat feature baru sudah mahal.**

Feature yang terlihat sederhana di UI bisa membutuhkan:

FE  
↓  
API Gateway  
↓  
Proto  
↓  
Service A  
↓  
Service B  
↓  
RabbitMQ  
↓  
Analytics  
↓  
Notification  
↓  
FE Socket

Karena itu SatuInbox tidak boleh memakai prinsip:

> "feature ini cuma butuh 2 hari."

Yang harus dipikir:

> **"Apakah feature ini memperkuat product thesis?"**

---

# **35\. Ada satu lagi: jangan buru-buru mengejar semua channel**

Ini agak kontra-intuitif.

SatuInbox sudah:

* WhatsApp Web  
* WhatsApp API  
* Instagram  
* Messenger  
* Email  
* Widget

Itu sudah cukup.

SleekFlow sendiri menjadikan channel sebagai foundation untuk inbox, automation, AI agents, dan broadcast.

Jadi **channel expansion bukan differentiation**.

Saya tidak akan menjadikan:

> Telegram  
>  LINE  
>  TikTok  
>  SMS  
>  Voice

sebagai prioritas utama kecuali ada demand enterprise yang jelas.

---

# **36\. Prioritas sebenarnya adalah depth**

Lebih baik:

6 channel  
\+  
excellent routing  
\+  
excellent SLA  
\+  
excellent AI  
\+  
excellent integration

daripada:

15 channel  
\+  
basic routing  
\+  
basic SLA  
\+  
basic AI  
\+  
basic integration  
---

# **37\. AI Roadmap yang saya rekomendasikan**

Urutannya:

### **Phase 1 — AI Assist**

Agent tetap manusia.

AI Summary  
AI Reply Suggestion  
AI Translation  
AI Tone  
AI Intent  
AI Tagging  
---

### **Phase 2 — AI Triage**

AI mulai mengatur pekerjaan.

Intent  
Priority  
Assignment  
SLA  
Ticket  
Routing  
---

### **Phase 3 — AI Resolution**

AI menyelesaikan conversation.

Question  
↓  
AI  
↓  
Knowledge  
↓  
API  
↓  
Action  
↓  
Answer  
---

### **Phase 4 — AI Operations**

AI mengelola operasi.

"Kenapa SLA hari ini turun?"

       ↓

AI analyze

       ↓

"Unassigned queue naik 27%  
sejak 13:00.

Penyebab utama:  
WhatsApp API account X  
mengalami reconnect."

       ↓

Recommendation

Ini yang menurut saya bisa menjadi **future moat SatuInbox**.

---

# **38\. SatuInbox vs competitor — positioning yang saya sarankan**

| Product | Core strength |
| ----- | ----- |
| Zendesk | Enterprise customer service |
| Intercom | AI-first customer support |
| Gorgias | E-commerce support |
| respond.io | Conversation \+ messaging automation |
| SleekFlow | Omnichannel engagement |
| Qontak | Indonesian all-in-one CRM/engagement |
| Barantum | CRM \+ Omnichannel \+ Call Center |
| **SatuInbox** | **Customer Operations untuk high-volume businesses** |

Dan vertical awal:

# **Logistics / Delivery / E-commerce**

---

# **39\. Jadi SatuInbox bukan "versi Indonesia dari Zendesk"**

Saya justru tidak akan mengambil strategi itu.

Lebih menarik:

> **SatuInbox \= operational conversation layer untuk bisnis Indonesia yang customer interaction-nya high-volume.**

Dengan:

WhatsApp-native  
\+  
Indonesia-native  
\+  
Enterprise workflow  
\+  
Logistics integrations  
\+  
AI Agent  
---

# **40\. Moat yang saya kejar**

Dalam 3–5 tahun, saya ingin SatuInbox memiliki:

                 SatuInbox  
                     │  
      ┌──────────────┼──────────────┐  
      │              │              │  
Conversation      Workflow       Customer  
   Graph            Graph          Graph  
      │              │              │  
      └──────────────┼──────────────┘  
                     │  
                 AI Layer  
                     │  
             Business Actions  
                     │  
             External Systems

Sehingga perusahaan tidak hanya menyimpan:

> chat.

Tetapi:

> **relationship \+ intent \+ workflow \+ outcome.**

Itu jauh lebih valuable.

# **41\. Strategic positioning final yang saya rekomendasikan**

Kalau saya harus membuat keputusan hari ini:

## **Product**

> **SatuInbox Customer Operations Platform**

### **Beachhead**

> **Logistics & Delivery**

### **Secondary**

> **E-commerce & high-volume retail**

### **Core problem**

> **Customer conversations are fragmented, manually handled, and disconnected from business operations.**

### **Core solution**

> **Turn conversations into routed, measurable, automated business workflows.**

### **Product pillars**

1\. Unified Conversation  
2\. Intelligent Routing  
3\. Ticket & SLA  
4\. AI Agent  
5\. Business Integrations  
6\. Operational Intelligence  
---

# **42\. Dan kalimat yang menurut saya paling penting untuk Product Team**

Saya akan jadikan ini sebagai **product north star**:

> **"SatuInbox bukan tempat agent membalas chat. SatuInbox adalah sistem yang memastikan setiap customer conversation mendapatkan tindakan yang tepat."**

Itu mengubah cara kita membuat produk.

Dari:

> "Customer bisa chat dari WhatsApp."

menjadi:

> "Customer mengatakan sesuatu → SatuInbox memahami → menentukan tindakan → menjalankan tindakan → memastikan selesai."

---

## **43\. Prioritas roadmap yang saya sarankan**

Kalau saya harus memberikan ranking sekarang:

| Priority | Area | Arah |
| ----- | ----- | ----- |
| **P0** | Conversation | Search, context, reliability |
| **P0** | Routing | SLA/capacity/skill/priority |
| **P0** | Ticket | Conversation → workflow |
| **P0** | AI | Intent \+ triage \+ assist |
| **P0** | Integration | API/webhook/business actions |
| **P1** | AI Agent | Autonomous resolution |
| **P1** | Logistics | Shipment/order/customer integrations |
| **P1** | Analytics | Operational intelligence |
| **P1** | QA | Conversation quality scoring |
| **P2** | Sales | Lead → conversation → conversion |
| **P2** | Marketing | Broadcast/segmentation |
| **P3** | New channels | Hanya jika ada enterprise demand |
| **STOP** | Generic ERP/HR/accounting | Di luar thesis |

---

# **44\. Satu hal yang menurut saya perlu segera diubah**

Saya justru melihat **feature `Visits + Leads` di mobile** sebagai sesuatu yang perlu dipertanyakan arah strategisnya.

Mobile sekarang sudah menjadi:

> inbox \+ visit \+ lead \+ check-in.

Kalau memang kebutuhan terbesar customer adalah logistics, ini bisa diarahkan menjadi:

> **field operation yang berhubungan dengan customer issue**

bukan menjadi:

> generic sales CRM.

Contoh:

Customer complaint  
      ↓  
Ticket  
      ↓  
Field visit required  
      ↓  
Assign field agent  
      ↓  
Visit  
      ↓  
GPS  
      ↓  
Proof  
      ↓  
Resolution

Nah, itu **sangat cocok dengan customer operations**.

Jadi fitur yang sudah ada tidak perlu dibuang — tetapi harus diarahkan.

---

# **45\. Kesimpulan saya**

Saya melihat **SatuInbox sudah memiliki fondasi yang sangat cocok untuk naik kelas**, tetapi justru karena fondasinya sudah besar, risiko terbesarnya sekarang adalah **feature sprawl**.

Pasar menunjukkan arah yang jelas:

**Omnichannel → Automation → AI → Action → Customer Operations.**

Zendesk bergerak ke predictive routing dan AI.  
 Intercom menggabungkan Inbox \+ Workflow \+ AI Agent \+ Copilot.  
 Gorgias mengambil vertical e-commerce.  
 respond.io menggabungkan conversation \+ AI \+ workflow/action.  
 Qontak dan Barantum mengambil posisi all-in-one CRM/omnichannel/AI di Indonesia.

**SatuInbox sebaiknya tidak mengikuti mereka secara horizontal.**

Justru manfaatkan fakta bahwa client terbesar Anda sudah mengarah ke:

**SAPX → Lion Parcel → Lincah → JNE**

untuk mengambil posisi:

# **SatuInbox \= Customer Operations Platform untuk Logistics, Delivery & High-Volume Businesses.**

Dan evolution-nya:

2024/25  
Omnichannel Chat  
      ↓  
2026  
Customer Operations  
      ↓  
2027  
AI Customer Operations  
      ↓  
2028+  
Autonomous Customer Operations

**Omnichannel tetap ada, tetapi menjadi foundation. Bukan tujuan akhir.**

Kalau positioning ini disetujui, menurut saya langkah berikutnya yang paling bernilai adalah membuat **“SatuInbox Product Strategy 2026–2028”** yang benar-benar operasional: saya bisa pecah menjadi **North Star → ICP → persona → positioning → competitive moat → feature matrix → feature yang harus dihentikan → roadmap Q3/Q4 2026 sampai 2028 → AI roadmap → JNE/SAPX/Lion Parcel use case → sales strategy → marketing strategy → KPI Product**, sehingga bisa dipakai sebagai filter resmi setiap PRD baru.

Ya. Dengan data client terbaru ini, **kesimpulan positioning SatuInbox saya akan revisi**. Ternyata vertical signal-nya tidak sesempit logistics. Yang lebih kuat justru adalah **high-volume customer operations**, dengan logistics sebagai salah satu vertical penting.

Data baru ini juga menunjukkan bahwa SatuInbox sudah dipakai pada **beberapa layer customer operation sekaligus**, bukan hanya omnichannel chat.

## **1\. Client & penggunaan SatuInbox — data terbaru**

| Client | Industri | Conversation | Ticketing | Broadcast | Group Chat | Sales | SLA / Statistics | Channel / Catatan |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **SAP / Digital Care** | Enterprise / Technology | ✓ | ✓ | — | — | ✓\* | ✓ | Widget, Email, WA Web, WA Official, Messenger, Instagram |
| **Lion Parcel** | Logistics | ✓ | **seharusnya ✓** | — | ✓ | — | — | WhatsApp Group |
| **Bantu Saku** | Fintech | — | ✓ | — | — | — | — | Ticketing |
| **Farmacare** | Healthcare / Pharmacy | ✓ | ✓ | — | ✓ | ✓ | — | Conversation \+ Group Chat \+ Ticketing \+ Sales |
| **Song Fa** | F\&B / Restaurant | ✓ | — | ✓ | — | — | — | Broadcast \+ Conversation |

\* Sales digunakan oleh **tim SAP yang berbeda** dari Digital Care.

Ini mengubah pembacaan saya terhadap SatuInbox.

# **2\. Insight paling penting: SatuInbox ternyata horizontal, tapi problemnya vertikal**

Sebelumnya saya melihat:

> SAPX → Lion Parcel → Lincah → JNE

dan menyimpulkan **Logistics** sebagai vertical utama.

Dengan tambahan:

* SAP / Digital Care  
* Bantu Saku  
* Farmacare  
* Song Fa

saya sekarang lebih melihat pola:

                   SATUINBOX  
                      │  
       ┌──────────────┼──────────────┐  
       │              │              │  
   Enterprise       Logistics      SMB/Mid  
       │              │              │  
      SAP         Lion Parcel      Song Fa  
       │  
    Fintech       Healthcare  
       │              │  
  Bantu Saku      Farmacare

Jadi **logistics bukan positioning utama**.

Logistics adalah salah satu vertical yang sangat cocok.

---

# **3\. Yang ternyata sama dari semua client**

Kalau kita hilangkan industrinya:

### **SAP**

Problem:

> banyak channel \+ banyak conversation \+ banyak agent \+ distribution \+ SLA \+ measurement.

### **Lion Parcel**

Problem:

> customer communication melalui WhatsApp Group \+ kemungkinan perlu ticketing untuk mengelola issue.

### **Bantu Saku**

Problem:

> customer issue perlu menjadi ticket dan ditangani secara terstruktur.

### **Farmacare**

Problem:

> conversation → group communication → ticket → sales.

### **Song Fa**

Problem:

> komunikasi customer \+ komunikasi outbound melalui broadcast.

Jadi pattern sebenarnya adalah:

Customer  
  ↓  
Conversation  
  ↓  
Classification  
  ↓  
Distribution  
  ↓  
Ticket / Sales / Broadcast  
  ↓  
Agent / Team  
  ↓  
SLA  
  ↓  
Statistics

**Ini jauh lebih penting daripada industrinya.**

---

# **4\. Maka saya revisi positioning SatuInbox**

Sebelumnya:

> **Customer Operations Platform for Logistics**

Sekarang saya lebih menyarankan:

# **Customer Operations Platform for High-Volume Businesses**

Dengan vertical solution:

SatuInbox  
│  
├── Enterprise Customer Service  
│  
├── Logistics & Delivery  
│  
├── Fintech  
│  
├── Healthcare  
│  
└── Retail / F\&B

Ini lebih sesuai dengan customer yang sebenarnya.

---

# **5\. Dan "Omnichannel" tetap menjadi foundation**

Dari data SAP saja terlihat sangat jelas.

SAP menggunakan:

* Widget Live Chat  
* Email  
* WhatsApp Web  
* WhatsApp Official  
* Messenger  
* Instagram

SatuInbox menyatukan channel-channel tersebut ke Conversation.

Kemudian:

Multiple Channels  
      ↓  
Conversation  
      ↓  
Team Inbox  
      ↓  
Round Robin  
      ↓  
Agent  
      ↓  
SLA  
      ↓  
Statistics

Ini sebenarnya sudah merupakan **Customer Operations workflow**.

Jadi positioning-nya jangan:

> "Kami punya banyak channel."

Tetapi:

> **"Kami mengubah banyak channel customer menjadi satu operational workflow."**

---

# **6\. SAP adalah contoh customer yang sangat penting**

Menurut saya SAP sekarang harus dijadikan **reference architecture** untuk SatuInbox.

Karena mereka menggunakan hampir seluruh core loop:

Channel  
 ↓  
Omnichannel  
 ↓  
Conversation  
 ↓  
Team Inbox  
 ↓  
Round Robin  
 ↓  
Agent  
 ↓  
Ticket  
 ↓  
SLA  
 ↓  
Statistics

Dan ada **Sales module yang digunakan oleh tim berbeda**.

Ini sangat menarik.

Artinya SatuInbox bukan hanya digunakan:

> satu department untuk customer service.

Tetapi berpotensi menjadi:

> **shared customer interaction infrastructure antar-department.**

---

# **7\. Ini membuka positioning yang lebih besar**

Bukan:

> Customer Service Software

tetapi:

# **Customer Interaction Operating System**

Saya tidak necessarily menyarankan menggunakan istilah ini di marketing sekarang, tetapi **secara product strategy**, konsepnya sangat bagus.

Karena customer interaction bisa berakhir ke:

Conversation  
    │  
    ├── Customer Service  
    │      └── Ticket  
    │  
    ├── Sales  
    │      └── Lead  
    │  
    ├── Marketing  
    │      └── Broadcast  
    │  
    └── Operations  
           └── Workflow  
---

# **8\. Ini menjelaskan kenapa Sales module tetap masuk akal**

Sebelumnya saya cukup khawatir Sales membuat product melebar.

Dengan informasi SAP \+ Farmacare, saya akan mengubah pendapat itu.

**Sales boleh tetap menjadi bagian SatuInbox.**

Tetapi jangan berkembang menjadi:

> "Sales CRM lengkap."

Sales harus tetap terhubung ke conversation.

Core flow:

Conversation  
     ↓  
Potential Customer  
     ↓  
Lead  
     ↓  
Sales  
     ↓  
Conversion

Farmacare sudah menunjukkan pola:

> Conversation \+ Group Chat \+ Ticketing \+ Sales.

Itu sebenarnya sangat cocok dengan thesis SatuInbox.

---

# **9\. Jangan buat Sales menjadi produk terpisah**

Saya akan menjaga boundary:

### **Good**

Customer  
↓  
Conversation  
↓  
Lead  
↓  
Sales Pipeline  
↓  
Conversion

### **Dangerous**

SatuInbox Sales  
↓  
Forecasting  
↓  
Commission  
↓  
Territory  
↓  
Quota  
↓  
Sales compensation  
↓  
Full Salesforce competitor

Yang kedua akan membuat development melebar.

---

# **10\. Ticketing ternyata jauh lebih fundamental daripada yang saya kira**

Dengan data baru:

* SAP → Ticketing  
* Lion Parcel → seharusnya Ticketing  
* Bantu Saku → Ticketing  
* Farmacare → Ticketing

Maka Ticketing bukan secondary feature.

Saya sekarang akan menempatkan:

# **Conversation \+ Ticketing**

sebagai **dua core object utama SatuInbox**.

---

# **11\. Conversation dan Ticket harus semakin menyatu**

Arsitektur produk sebaiknya:

                CUSTOMER  
                   │  
                   ▼  
             CONVERSATION  
                   │  
          ┌────────┼────────┐  
          │        │        │  
          ▼        ▼        ▼  
       Answer    Sales    Ticket  
                            │  
                            ▼  
                          SLA  
                            │  
                            ▼  
                        Resolution

Bukan:

Conversation  
Ticketing  
Sales  
Broadcast

sebagai empat fitur terpisah.

---

# **12\. Ticketing harus menjadi "operationalization" dari conversation**

Misalnya customer SAP bilang:

> "Saya sudah kirim dokumen tapi belum diproses."

Conversation:

Intent \= Document Issue

Agent bisa:

> Create Ticket

Kemudian:

Ticket  
├── Priority  
├── Assignee  
├── Team  
├── SLA  
├── Stage  
└── Resolution

Conversation menjadi **customer interaction**.

Ticket menjadi **internal work**.

Ini fundamental.

---

# **13\. SLA juga bukan sekadar reporting**

Dari SAP:

> SLA digunakan untuk menghitung metrik agent mereka dan otomatis menggunakan Statistics SatuInbox.

Ini sangat penting.

Artinya SLA sudah menghasilkan **operational management value**, bukan sekadar compliance.

Flow-nya:

Conversation  
     ↓  
Assignment  
     ↓  
Agent Response  
     ↓  
SLA  
     ↓  
Agent Performance  
     ↓  
Statistics  
     ↓  
Management Decision

Backend SatuInbox memang sudah memiliki FRT, TTC, RLT, wait time dan SLA state machine.

---

# **14\. Ini membuka satu product pillar baru**

Saya akan menyebutnya:

# **Operational Intelligence**

Bukan hanya:

> Statistics.

Statistics menjawab:

> "Apa yang terjadi?"

Operational Intelligence harus menjawab:

> "Kenapa terjadi?"

dan:

> "Apa yang harus dilakukan?"

Contoh:

**Statistics:**

> Average FRT \= 12 menit.

**Operational Intelligence:**

> FRT meningkat 38% pada shift 13:00–17:00 karena unassigned conversation naik 24%.

**AI Recommendation:**

> Tambahkan 2 agent ke Team A pada jam 13:00–15:00.

Ini jauh lebih valuable.

---

# **15\. Round Robin juga jangan berhenti di Round Robin**

SAP sudah menggunakan:

> Team Inbox \+ Round Robin.

Ini foundation bagus.

Tetapi roadmap berikutnya:

### **Level 1**

Round Robin

A → B → C → A

### **Level 2**

Capacity-based

Agent A \= 8 active  
Agent B \= 2 active

→ assign B

### **Level 3**

Skill-based

Customer issue \= Technical

→ Technical Team

### **Level 4**

SLA-aware

SLA breach risk high

→ agent dengan capacity \+ skill terbaik

### **Level 5**

AI / predictive routing

Intent  
\+  
Skill  
\+  
Capacity  
\+  
Historical resolution time  
\+  
SLA risk

→ Best agent

Ini mengikuti arah pasar yang sekarang juga terlihat pada predictive routing enterprise.

---

# **16\. Farmacare memberi signal yang berbeda**

Farmacare menggunakan:

* Conversation  
* Group Chat  
* Ticketing  
* Sales

Ini menarik karena menunjukkan **Conversation bukan selalu 1 customer → 1 agent**.

Ada kebutuhan:

Customer  
 ↓  
Group  
 ↓  
Conversation  
 ↓  
Ticket  
 ↓  
Sales

Maka **Group Chat** jangan dianggap feature kecil.

Ia bisa menjadi bagian dari:

# **Collaborative Customer Operations**

Contoh:

Customer issue:

> "Saya punya masalah dengan produk."

Conversation masuk.

Kemudian agent membutuhkan:

* sales  
* operational  
* specialist

Mereka dapat bekerja dalam collaborative conversation.

---

# **17\. Lion Parcel juga memberikan signal penting tentang Group Chat**

Lion Parcel menggunakan WhatsApp Group.

Dan Anda mengatakan:

> nantinya seharusnya menggunakan ticketing juga.

Ini sangat menarik untuk product strategy.

Karena SatuInbox bisa mengubah:

WhatsApp Group  
     ↓  
Conversation  
     ↓  
Ticket  
     ↓  
Team  
     ↓  
SLA  
     ↓  
Resolution

Artinya **Group Chat → Ticket** bisa menjadi use case enterprise yang kuat.

---

# **18\. Jangan hanya membuat Group Chat menjadi "chat room"**

Ini penting.

Group Chat seharusnya bisa menjadi:

> **Operational collaboration layer.**

Misalnya:

Customer Group  
     │  
     ▼  
Conversation  
     │  
     ▼  
Ticket  
     │  
     ├── Customer  
     ├── CS  
     ├── Operations  
     ├── Sales  
     └── Specialist

SatuInbox bisa menjadi tempat semua pihak bekerja terhadap masalah yang sama.

---

# **19\. Song Fa memberi signal lain: Broadcast**

Song Fa menggunakan:

> Broadcast \+ Conversation.

Ini menunjukkan SatuInbox tidak hanya:

**Reactive Customer Service**

tetapi juga:

# **Proactive Customer Engagement**

Flow:

Broadcast  
  ↓  
Customer Response  
  ↓  
Conversation  
  ↓  
Sales / Ticket

Ini sebenarnya sangat powerful.

Broadcast tidak boleh berdiri sendiri.

---

# **20\. Broadcast \+ Conversation \+ Sales**

Contohnya:

Campaign  
  ↓  
Broadcast  
  ↓  
Customer replies  
  ↓  
Conversation  
  ↓  
Intent  
  ↓  
Lead  
  ↓  
Sales

Ini membuat Broadcast memiliki measurable business outcome.

Bukan sekadar:

> "berapa pesan terkirim?"

Tetapi:

> "berapa conversation?"

> "berapa lead?"

> "berapa conversion?"

# **21\. Maka saya sekarang melihat SatuInbox punya 4 engine**

Ini menurut saya model product yang paling pas setelah data client diperbarui.

# **1\. Conversation Engine**

WhatsApp  
Email  
Instagram  
Messenger  
Widget  
Group Chat

↓

**Unified Customer Conversation**

---

# **2\. Operation Engine**

Team Inbox  
Round Robin  
Assignment  
Ticket  
SLA  
Workflow

↓

**Get the work done**

---

# **3\. Revenue / Engagement Engine**

Sales  
Lead  
Broadcast  
Campaign

↓

**Acquire & convert customers**

---

# **4\. Intelligence Engine**

Statistics  
Analytics  
AI  
Intent  
Prediction  
Recommendation

↓

**Understand & optimize**

---

# **22\. Ini membuat product architecture-nya jauh lebih jelas**

                        SATUINBOX  
                            │  
          ┌─────────────────┼─────────────────┐  
          │                 │                 │  
          ▼                 ▼                 ▼  
    Conversation        Operation         Engagement  
      Engine              Engine             Engine  
          │                 │                 │  
    ┌─────┼─────┐      ┌────┼────┐       ┌────┴────┐  
    │     │     │      │    │    │       │         │  
   WA    Email Widget  Team Ticket SLA  Broadcast  Sales  
    │                 Inbox  
    │  
    └─────────────────┬──────────────────────┘  
                      ▼  
               Intelligence  
                    Engine  
                      │  
               AI / Analytics  
---

# **23\. Target market saya revisi menjadi seperti ini**

Bukan:

> Logistics only.

Dan bukan:

> Semua bisnis.

Saya akan gunakan konsep:

# **High-Volume Customer Operations**

Dengan priority:

### **Tier 1 — Enterprise**

* Technology  
* Telecom  
* Logistics  
* Fintech  
* Healthcare  
* Retail

### **Tier 2 — Mid-market**

* E-commerce  
* F\&B chain  
* Education  
* Services

### **Tier 3**

SMB.

Tapi **enterprise/high-volume tetap menjadi core ICP**.

---

# **24\. Kenapa high-volume?**

Karena semua fitur SatuInbox menjadi semakin bernilai ketika volume meningkat.

Misalnya:

### **100 conversations/day**

Round Robin:

> nice to have.

### **10.000 conversations/day**

Round Robin:

> critical.

### **100.000 conversations/day**

SLA \+ routing \+ analytics \+ automation:

> business infrastructure.

Itulah sweet spot SatuInbox.

---

# **25\. ICP yang lebih tepat**

Saya akan mendefinisikan ICP seperti ini:

> **Perusahaan dengan customer interaction volume tinggi, multi-channel customer service, multiple customer-facing teams, dan membutuhkan SLA serta centralized operational visibility.**

Checklist:

✓ Banyak customer  
✓ Banyak conversation  
✓ Banyak agent  
✓ Banyak team  
✓ Multiple channels  
✓ SLA  
✓ Ticket  
✓ Operational workflow  
✓ Management reporting

Semakin banyak ✓:

> semakin cocok SatuInbox.

---

# **26\. Dengan demikian, SAP justru sangat strategic**

SAP bukan hanya customer.

SAP adalah **proof bahwa thesis ini bekerja**.

Karena mereka menggunakan:

6 channels  
\+  
Conversation  
\+  
Team Inbox  
\+  
Round Robin  
\+  
Ticketing  
\+  
SLA  
\+  
Statistics  
\+  
Sales

Ini hampir merupakan blueprint SatuInbox Enterprise.

---

# **27\. Saya akan membuat SAP sebagai "flagship use case"**

Bukan marketing:

> "SAP menggunakan SatuInbox."

Tapi:

> **"How SAP centralizes multi-channel customer operations with SatuInbox."**

Case study harus menunjukkan:

Before  
↓  
Multiple channels  
↓  
Manual distribution  
↓  
Limited SLA visibility

After  
↓  
Unified Conversation  
↓  
Team Inbox  
↓  
Round Robin  
↓  
SLA  
↓  
Statistics

Itu jauh lebih kuat.

---

# **28\. Client matrix sekarang memberikan positioning yang sangat bagus**

| Client | Bukti product |
| ----- | ----- |
| SAP | Enterprise omnichannel \+ routing \+ SLA \+ analytics \+ ticket |
| Lion Parcel | WhatsApp Group \+ logistics \+ ticket opportunity |
| Bantu Saku | Fintech ticketing |
| Farmacare | Conversation \+ collaboration \+ ticket \+ sales |
| Song Fa | Engagement \+ broadcast \+ conversation |

Jadi market validation-nya:

Enterprise  
     ✓ SAP

Logistics  
     ✓ Lion Parcel  
     ✓ SAPX  
     ✓ Lincah

Fintech  
     ✓ Bantu Saku

Healthcare  
     ✓ Farmacare

F\&B  
     ✓ Song Fa

Ini **jauh lebih kuat** daripada asumsi logistics-only.

---

# **29\. Maka positioning final saya sekarang**

## **Product category**

# **Customer Operations Platform**

## **ICP**

# **High-volume businesses with multi-channel customer operations**

## **Core value**

> **Unify customer conversations, automate work distribution, manage service operations, and measure customer-facing performance in one platform.**

## **Differentiation**

Omnichannel  
\+  
Operational workflow  
\+  
Ticketing  
\+  
SLA  
\+  
Routing  
\+  
Sales / engagement  
\+  
AI  
---

# **30\. Dan saya akan mengubah roadmap AI**

Karena client sudah menggunakan Round Robin, SLA, Statistics, Ticketing, dll., AI sebaiknya **duduk di atas workflow yang sudah ada**, bukan menjadi feature terpisah.

### **AI Phase 1**

Conversation  
↓  
Intent  
↓  
Auto Tag  
↓  
Priority

### **AI Phase 2**

Intent  
↓  
Routing  
↓  
Team  
↓  
Agent

### **AI Phase 3**

Intent  
↓  
Answer  
↓  
Ticket  
↓  
API Action

### **AI Phase 4**

Conversation  
↓  
AI  
↓  
Business Action  
↓  
Resolution

### **AI Phase 5**

All Operations Data  
↓  
AI  
↓  
Operational Insight  
↓  
Recommendation  
↓  
Automatic Optimization  
---

# **31\. Product development rule juga saya revisi**

Untuk setiap PRD baru, tanyakan:

### **A. Conversation**

> Apakah ini membuat customer interaction lebih mudah dikelola?

### **B. Operation**

> Apakah ini membuat agent/team bekerja lebih efektif?

### **C. Engagement / Revenue**

> Apakah ini membantu customer engagement atau conversion?

### **D. Intelligence**

> Apakah ini menghasilkan insight atau automation?

### **E. Enterprise**

> Apakah ini relevan untuk perusahaan dengan volume besar?

Kalau feature tidak punya hubungan dengan minimal **2 dari 5** di atas:

> **harus dipertanyakan sebelum masuk roadmap.**

---

# **32\. Dan saya akan menambahkan satu aturan khusus**

Karena SatuInbox sekarang sudah punya banyak modul:

> **Jangan mengembangkan module secara horizontal hanya karena kompetitor punya.**

Contoh:

Competitor punya:

> Call Center.

Pertanyaannya bukan:

> "Kapan SatuInbox punya Call Center?"

Tapi:

> "Apakah customer SatuInbox membutuhkan voice untuk menyelesaikan customer operation?"

Kalau iya → build/integrate.

Kalau tidak → jangan.

---

# **33\. Jadi sekarang saya melihat arah SatuInbox seperti ini**

                   SATUINBOX  
                      │  
                      ▼  
         HIGH-VOLUME CUSTOMER OPS  
                      │  
      ┌───────────────┼───────────────┐  
      │               │               │  
      ▼               ▼               ▼  
Conversation       Operation      Engagement  
      │               │               │  
  Channels         Ticketing       Broadcast  
  Group Chat       SLA             Sales  
  Contacts         Routing  
                   Team Inbox  
                      │  
                      └─────────┐  
                                ▼  
                          Intelligence  
                                │  
                             AI / ML  
                                │  
                                ▼  
                         AUTOMATION  
                                │  
                                ▼  
                        BUSINESS ACTION

Ini menurut saya **lebih tepat daripada "SatuInbox \= omnichannel CRM"**.

Omnichannel adalah **foundation**.

Ticketing \+ routing \+ SLA adalah **operation**.

Sales \+ broadcast adalah **engagement**.

AI adalah **intelligence**.

Dan semuanya bertemu di:

# **Customer Operations.**

---

## **34\. Prioritas strategis setelah update client**

Saya akan urutkan:

| Priority | Fokus | Alasan |
| ----- | ----- | ----- |
| **P0** | Conversation reliability & UX | Core entry point semua client |
| **P0** | Ticket ↔ Conversation | Dipakai SAP, Bantu Saku, Farmacare; potensial Lion Parcel |
| **P0** | Team Inbox \+ intelligent routing | SAP sudah membuktikan value |
| **P0** | SLA \+ Statistics | Sudah menjadi KPI nyata SAP |
| **P0** | AI Intent / classification | Layer berikutnya di atas conversation |
| **P1** | AI routing | Evolusi Round Robin |
| **P1** | AI Agent | Evolusi automation |
| **P1** | Group Chat → Ticket | Relevan Lion Parcel/Farmacare |
| **P1** | Broadcast → Conversation → Sales | Relevan Song Fa/Farmacare |
| **P1** | Conversation → Sales | Relevan SAP/Farmacare |
| **P1** | Operational Intelligence | Evolusi Statistics |
| **P2** | Vertical integrations | Shipping, fintech, healthcare, dll |
| **P2** | More channels | Hanya berdasarkan demand |
| **P3** | Generic CRM features | Jangan melebar |
| **P3** | Generic ERP features | Di luar thesis |

---

### **Kesimpulan terbaru**

Dengan data client yang baru, saya **tidak lagi merekomendasikan SatuInbox memposisikan diri terutama sebagai "Logistics Customer Operations Platform."**

Saya lebih yakin:

# **SatuInbox \= Customer Operations Platform untuk perusahaan dengan customer interaction volume tinggi.**

Dan client saat ini sudah membuktikan empat use case utama:

**SAP → enterprise customer operations**  
 **Lion Parcel → logistics \+ group communication**  
 **Bantu Saku → ticket-based support**  
 **Farmacare → conversation \+ collaboration \+ ticket \+ sales**  
 **Song Fa → proactive engagement \+ broadcast**

Sehingga arah produknya bukan:

> **"fitur apa lagi yang bisa kita tambahkan?"**

melainkan:

> **"bagaimana membuat setiap customer conversation berubah menjadi pekerjaan yang terdistribusi dengan benar, memiliki SLA, diselesaikan, dan menghasilkan insight?"**

Itu yang menurut saya bisa menjadi **filter utama development SatuInbox mulai sekarang**.

