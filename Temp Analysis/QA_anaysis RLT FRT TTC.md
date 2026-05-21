C:\Users\MyBook SAGA 12\Desktop\PRDanalisis\PRD\SLA conversation n ticket

analisa conversation SLA dan ticket ini, terutama tambahan PRD RLT, ada di dalam folder nya

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

PENTING!
skenario utama untuk SLA conversation

company : wadah dimana admin dan member menghandle customer
member : user yang tergabung di company
agent : sebutan role untuk tingkat staff
supervisor/spv : sebutan role untuk tingkat lead dari staff / supervisor
admin : sebutan untuk role dengan permission tertinggi
receipent : orang yang berhubungan dengan para member atau admin

1. conversation di create ketika :
   a. broadcast ( outbound message )
   b. menerima message dari luar satuinbox ( inbound message )
   c. reopen conversation dengan status closed

2. lalu SLA dihitung,
   2a. RULE : "SLA di jeda", atau bisa di sebut agent centric
   ***
   i. jika conversation create because a broadcast,
   a. FRT dan TTC harus paused hingga,
   b. receipent si penerima broadcast ini meresponse, FRT dan TTC baru di count
   c. RLT ( fitur baru ) dihitung dari waktu pertama kali receipent membalas, hingga member di assign dan pertama kali meresponse receipent chat, rentang waktu tersebut akan dikurangi dengan waktu saat member di assign k conversation, hingga member membalas chat receipent "RLT = First Customer-Facing Agent Reply Time - First Agent Assignment Time"
   d. ketika member di assign k conversation, harus ada catatan waktu nya untuk perhitungan FRT dan RLT
   e. setelah member membalas, FRT dihitung dari waktu member di assign hingga waktu balasan member tersebut. Lalu TTC kembali dijeda, perilaku pause and count ini akan berulang terus hingga conversation di close. pengulangan pause and count hanya berlaku untuk TTC
   f. TTC akan dihitung dari chat pertama receipent hingga chat terakhir member, TTC counted ketika conversation closed
   ***
   ii. jika conversation created because an inbound,
   a. FRT dan TTC harus count,
   b. RLT ( fitur baru ) dihitung dari waktu receipent inbound, hingga member di assign dan meresponse pertama kali receipent chat, rentang waktu tersebut akan dikurangi dengan waktu saat member di assign k conversation, hingga member membalas chat receipent "RLT = First Customer-Facing Agent Reply Time - First Agent Assignment Time"
   c. ketika member di assign k conversation, harus ada catatan waktu nya untuk perhitungan FRT dan RLT
   d. setelah member membalas, FRT dihitung dari waktu member di assign hingga waktu balasan member tersebut. Lalu TTC kembali dijeda, perilaku pause and count ini akan berulang terus hingga conversation di close. pengulangan pause and count hanya berlaku untuk TTC
   e. TTC akan dihitung dari chat pertama receipent hingga chat terakhir member, TTC counted ketika conversation closed
   ***
   iii. jika conversation created because reopen,
   a. FRT dan TTC harus paused,
   b. member yang reopen otomatis assigned, lalu member mengirim chat
   c. receipent meresponse, FRT dan TTC baru di count
   d. RLT ( fitur baru ) dihitung dari waktu pertama kali receipent membalas, hingga member pertama kali meresponse receipent chat, rentang waktu tersebut akan dikurangi dengan waktu saat member di assign k conversation, hingga member membalas chat receipent "RLT = First Customer-Facing Agent Reply Time - First Agent Assignment Time"
   e. ketika member di assign k conversation, harus ada catatan waktu nya untuk perhitungan FRT dan RLT
   f. setelah member membalas, FRT dihitung dari waktu receipent chat hingga waktu balasan member tersebut. Lalu TTC kembali dijeda, perilaku pause and count ini akan berulang terus hingga conversation di close. pengulangan pause and count hanya berlaku untuk TTC
   g. TTC akan dihitung dari chat pertama member hingga chat terakhir member, TTC counted ketika conversation closed
   ***
   ***
   2b. RULE : "SLA di TIDAK jeda", atau bisa di sebut customer centric
   ***
   i. jika conversation create because a broadcast,
   a. FRT dan TTC count,
   b. receipent si penerima broadcast ini meresponse, FRT dan TTC tetap running count
   c. RLT ( fitur baru ) dihitung dari waktu pertama kali receipent membalas, hingga member di assign dan pertama kali meresponse receipent chat, rentang waktu tersebut akan dikurangi dengan waktu saat member di assign k conversation, hingga member membalas chat receipent "RLT = First Customer-Facing Agent Reply Time - First Agent Assignment Time"
   d. ketika member di assign k conversation, harus ada catatan waktu nya untuk perhitungan FRT dan RLT
   e. setelah member membalas, FRT dihitung dari waktu member di assign hingga waktu balasan member tersebut. TTC tetap running
   f. TTC akan dihitung dari chat pertama receipent hingga chat terakhir member, TTC counted ketika conversation closed
   ***
   ii. jika conversation created because an inbound,
   a. FRT dan TTC count,
   b. RLT ( fitur baru ) dihitung dari waktu receipent inbound, hingga member di assign dan meresponse pertama kali receipent chat, rentang waktu tersebut akan dikurangi dengan waktu saat member di assign k conversation, hingga member membalas chat receipent "RLT = First Customer-Facing Agent Reply Time - First Agent Assignment Time"
   c. ketika member di assign k conversation, harus ada catatan waktu nya untuk perhitungan FRT dan RLT
   d. setelah member membalas, FRT dihitung dari waktu member di assign hingga waktu balasan member tersebut. TTC tetap running
   e. TTC akan dihitung dari chat pertama receipent hingga chat terakhir member, TTC counted ketika conversation closed
   ***
   iii. jika conversation created because reopen,
   a. FRT dan TTC count,
   b. member yang reopen otomatis assigned, lalu member mengirim chat
   c. receipent meresponse, FRT dan TTC tetap running count
   d. RLT ( fitur baru ) dihitung dari waktu pertama kali receipent membalas, hingga member pertama kali meresponse receipent chat, rentang waktu tersebut akan dikurangi dengan waktu saat member di assign k conversation, hingga member membalas chat receipent "RLT = First Customer-Facing Agent Reply Time - First Agent Assignment Time"
   e. ketika member di assign k conversation, harus ada catatan waktu nya untuk perhitungan FRT dan RLT
   f. setelah member membalas, FRT dihitung dari waktu receipent chat hingga waktu balasan member tersebut. TTC tetap running
   g. TTC akan dihitung dari chat pertama member hingga chat terakhir member, TTC counted ketika conversation closed

SLA conversation ini dipengaruhi juga oleh office hour
jika diluar jam kerja, FRT akan dihitung sesuai dengan actual time
jika didalam jam kerja, dihitung sesuai dengan jam kerja di kurangi dengan gap outside office hour

PENTING!
skenario utama untuk SLA ticket

ticket created from

1. conversation as ticket ( whole conversation )
2. bubble chat from conversation
3. created from ticket page

ticket created dari ticket page tidak memiliki channel source

tiap ticket memiliki

1. detail ticket
2. ticket room chat
3. judul dan deskripsi
4. nomor ticket
5. ticket type, berisi rule tertentu untuk handle operasional ticket, secara default ticket type memiliki stages submited, active, done
   a. setiap stage, memiliki rentang waktu/SLA yg dapat di set sesuai dengan kebutuhan
   b. active stage, dapat di customisasi, bisa di buat menjadi lebih dari 1 active stage

flow create ticket :

1. conversation as ticket
   a. ketika conversation room terbuka, provide button create as ticket
   b. butoon create di klik, popup a modal, member harus, memilih ticket type,
   c. pilihan ticket type muncul sesuai dengan apa yang di create admin company
   d. ketika ticket type telah di pilih, muncul field yang perlu diisi oleh member, ada yg mandatory, ada yg tidak
   e. ketika create ticket, secara otomatis ticket akan di assign ke member yang membuat ticket, sekaligus sebagai penanggung jawab ticket tsb
   f. setelah submit, tampilah list conversation berubah, ada nya icon ticket, lalu di conversation detail ada section that displayed related ticket / ticket yang baru di buat ( clickable as shortcut)
   g. klik ticket shortcut, lalu di alihkan ke halaman ticket, langsung membuka ticket dan tampilkan room dan detail ticket
   h. ticket room menampilkan value chat yang sama persis dengan converation
   i. member bisa mengirim chat d ticket room, ada 2 opsi;
   - defaultnya kirim chat as internal notes, dan
   - ada opsi kirim chat to conversation, dimana chat yang dikirim ini akan di terima oleh receipent

   PERHITUNGAN SLA TICKET
   j. ketika ticket berhasil dibuat, stage submited SLA count is running
   k. FRT and TTC ticket paused
   l. ketika member kirim internal notes atau chat to conersation, FRT count, dihitung dari waktu ticket dibuat hingga
   m. member mengirim chat di room ticket ( )
