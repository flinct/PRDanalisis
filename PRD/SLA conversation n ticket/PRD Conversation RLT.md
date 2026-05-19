Implement two new response metrics for SatuInbox:

1.  **Response Lead Time (RLT)**  
    Measures staff handling time after a conversation is assigned to an agent.

```
RLT = First Customer-Facing Agent Reply Time - First Agent Assignment Time
```

2.  **Wait Time in Queue**  
    Measures how long the customer waits before the conversation is assigned to an agent.

```
Wait Time in Queue = First Agent Assignment Time - First Customer Inbound Message Time
```

These metrics are added as **tracked metrics only** in Phase 1. They must be stored in database, displayed as live timers in Conversation Detail and linked Ticket Detail, and included in Offline Report Download exports.

Existing **FRT** and **TTC** are already available and must not be changed.

What’s New
Area

Scope

New Metric: RLT

Track time from first agent assignment until first successful customer-facing reply.

New Metric: Wait Time in Queue

Track time from first customer inbound message until first agent assignment.

Live Timer

Show running timer in Conversation Detail.

Linked Ticket Support

Show the same metrics in Ticket Detail when ticket is linked to a customer conversation.

Internal-only Ticket Handling

Show Tidak berlaku for tickets without linked customer conversation.

Offline Report Export

Add RLT and Wait Time columns to Conversation and Ticket XLSX reports.

Database Persistence

Store timestamps, raw duration, adjusted duration, status, and quality flags.

Reassignment Handling

RLT starts from first assignment and does not reset on reassignment before first reply.

Multi-assignee Handling

Use earliest assignment as T2 and attribute first response to the agent who sends the first customer-facing reply.

AUX / Snooze Handling

Apply only to adjusted RLT when existing SLA pause policy supports it.

No Alert in Phase 1

No reminder, breach, escalation, sound, or notification for RLT and Wait Time.

Out of Scope
Item

Reason

FRT changes

Already implemented.

TTC changes

Already implemented.

RLT SLA threshold

Not part of Phase 1.

Wait Time SLA threshold

Not part of Phase 1.

Alert / reminder / breach

Phase 1 is metric tracking and visibility only.

Dashboard widget

Not included yet.

New SLA settings UI

Not included yet.

Acceptance Criteria
ID

Acceptance Criteria

AC-01

Given a conversation receives the first customer message, when no agent is assigned yet, then Waktu Antre timer runs from T1.

AC-02

Given an agent is assigned, when T2 is recorded, then Waktu Antre stops and final duration is stored.

AC-03

Given an agent is assigned and has not replied, when Conversation Detail is opened, then Waktu Kerja Staf timer runs from T2.

AC-04

Given the first successful customer-facing reply is sent, when T3 is recorded, then RLT timer stops and final duration is stored.

AC-05

Internal notes, failed replies, drafts, and system messages must not count as T3.

AC-06

Reassignment before first reply must not reset primary RLT.

AC-07

For multi-assignee conversations, first assignment timestamp is used as T2 and first replying agent is stored as first responder.

AC-08

Linked tickets show inherited metrics from linked conversation.

AC-09

Internal-only tickets show Tidak berlaku.

AC-10

Offline Report Download for Conversation and Ticket includes RLT and Wait Time columns.

AC-11

No alert, reminder, breach badge, notification, or escalation is triggered by RLT or Wait Time in Phase 1.

Suggested Column Additions for Export
Report

New Columns

Conversation

First Customer Message At, First Assigned At, First Customer Reply At, Wait Time in Queue, Response Lead Time, RLT Adjusted, First Assignee, First Responder, Metric Status, Metric Quality Flags

Ticket

Linked Conversation ID, Response Metric Source, First Customer Message At, First Assigned At, First Customer Reply At, Wait Time in Queue, Response Lead Time, RLT Adjusted, Metric Status, Metric Quality Flags

//promt rabu
C:\Users\MyBook SAGA 12\Desktop\PRDanalisis\PRD\SLA conversation n ticket

analisa conversation SLA dan ticket ini, ada tambahan PRD juga tentang RLT, ada di dalam folder nya
juga ada bug terkait SLA ini

hasil analisa bug nya, sebenarnya ini adalah gap flow terkait SLA :
Chat yang masuk di ticket seharusnya 1:1 dengan source conversation yang terkait. Komunikasi yang dilakukan di ticket harus diterima juga di conversation, dan sebaliknya. Saat ini message count tidak sinkron dan menyebabkan FRT/TTC tidak berjalan dengan benar.

Cara Pembuatan Ticket:

Conversation as Ticket — source = conversation room
Bubble Message as Ticket — source = specific bubble message dari conversation
Create dari halaman Ticket — source = kosong (tidak ada conversation terkait)
Confirmed Behavior:

1. Chat di Ticket (Bubble as Ticket)

Chat yang ditampilkan di ticket dimulai dari bubble message yang menjadi sumber ticket, bukan dari awal conversation
Pesan selanjutnya dari conversation yang masuk setelah bubble tersebut akan terus masuk ke ticket
Scope chat di ticket = bubble message + semua pesan setelahnya dari conversation yang sama
Note: Jika 1 conversation menghasilkan lebih dari 1 bubble ticket, pesan setelah masing-masing bubble akan muncul di lebih dari 1 ticket — ini intended behavior, bukan bug 2. Customer Reply — Deteksi Otomatis

Pesan customer dari conversation otomatis masuk ke ticket jika ticket dibuat dari conversation tersebut (baik conversation as ticket maupun bubble message as ticket)
Tidak perlu action manual dari agent
Ticket yang dibuat tanpa source conversation tidak akan menerima pesan otomatis dari manapun 3. Conversation Closed vs Ticket Open

Ketika conversation di-close, ticket bisa tetap open
Cross-send dari ticket ke closed conversation harus diblokir
Berikan notifikasi: "Conversation is closed, cannot send cross message"
Komunikasi selanjutnya di ticket yang open hanya bisa via internal notes 4. FRT (First Response Time) Logic

FRT trigger: salah satu assignee ticket membalas di ticket, setelah ada respons pertama dari customer (customer selalu membalas dari conversation, dan otomatis masuk ke ticket).

Assignee bisa lebih dari 1, siapapun yang reply pertama kali dianggap sebagai FRT trigger
Jika setting FRT dijeda: timer pause saat menunggu balasan customer, resume ketika customer reply masuk ke ticket
Jika setting FRT tidak dijeda: timer berjalan terus dari ticket created
FRT — Skenario Edge Case:

Skenario Behaviour
Conversation closed sebelum customer sempat reply FRT di-set ke nilai maksimum sesuai setting user (contoh: jika limit FRT = 50 menit, maka FRT = 50 menit)
Ticket tanpa source conversation Lihat poin 5 5. SLA untuk Ticket Tanpa Source Conversation — Opsi B (Confirmed)

Ticket saat dibuat selalu berada di stage Not Started (Submitted)
Ketika ticket mulai di-handle, agent mengubah stage ke Active (In Progress atau stage aktif lainnya sesuai konfigurasi user — stage active bisa dibagi ke beberapa tahapan)
FRT dihitung dari perubahan stage Not Started → Active sebagai pengganti trigger dari conversation event
TTC tetap berjalan dari ticket created sampai ticket closed
Opsi B ini berlaku jika memungkinkan secara teknis — jika ada constraint, fallback ke Opsi A (SLA nonaktif)
Stage Ticket — Definisi:

Stage Keterangan
Not Started / Submitted Stage awal saat ticket pertama dibuat
Active Stage ketika ticket sedang di-handle (bisa In Progress atau tahapan lainnya sesuai kebutuhan user)
Closed Ticket selesai — TTC tercapai 6. Multi-Ticket dari 1 Conversation (Bubble)

1 conversation bisa menghasilkan lebih dari 1 ticket aktif (dari bubble yang berbeda)
Setiap ticket harus menyimpan referensi source_message_id (bukan hanya source_conversation_id) untuk filtering yang benar
Chat di masing-masing ticket di-scope berdasarkan timestamp/message-id dari bubble masing-masing
Actual :

Message count di ticket dan conversation tidak sinkron (tidak 1:1)
FRT dan TTC tidak berjalan ketika chat tidak tersinkronisasi dengan benar
Ketika conversation di-close lalu user kirim cross-send dari ticket, sistem membuka conversation room baru secara silent — history chat dari POV customer tidak continuous
Expectation :

Chat di ticket dimulai dari bubble message sumber ticket, dan meneruskan pesan berikutnya dari conversation
Pesan customer dari conversation otomatis masuk ke ticket tanpa action manual dari agent
Ketika conversation CLOSED, cross-send di ticket terkait diblokir dengan notifikasi yang jelas
Ticket tetap bisa open walaupun conversation sudah closed, komunikasi lanjutan hanya via internal notes
FRT dihitung sejak ticket dibuat, di-trigger ketika salah satu assignee reply pertama kali setelah customer membalas dari conversation
Jika conversation closed sebelum customer reply, FRT di-set ke nilai maksimum sesuai setting (tidak dibiarkan menggantung)
TTC berjalan normal dari ticket created sampai ticket closed
Ticket tanpa source conversation: FRT dihitung dari stage Not Started → Active (Opsi B), jika tidak memungkinkan secara teknis maka SLA dinonaktifkan (Opsi A)
