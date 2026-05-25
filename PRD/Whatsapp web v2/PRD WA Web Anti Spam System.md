# **The Human-Like Flow**

Anda harus meniru siklus interaksi manusia.

### **1\. Checklist Eksekusi Broadcast**

Setiap kali bot akan mengirim pesan, pastikan melewati **Pipeline** berikut. Jangan pernah memanggil sendMessage secara telanjang (raw).

**A. Fase Pra-Kirim (Intelligence)**

* \[ \] **Cek Status Target:** Panggil await sock.presenceSubscribe(jid) untuk memancing status target.  
* \[ \] **Validasi Koneksi:** Pastikan event connection.update tidak sedang melempar error 428 (Connection Closed) atau 408 (Timeout).

**B. Fase Interaksi (The Act)**

Jalankan urutan fungsi ini secara berurutan (*sequential*):

1. **Online Trigger:**  
   await sock.sendPresenceUpdate('available', jid)  
   *(Menandakan Anda membuka aplikasi)*  
2. **Delay Persepsi (1-2 detik):**  
   await delay(random(1000, 2000))  
   *(Jeda manusia melihat layar)*  
3. **Read Receipt (Jika membalas pesan):**  
   await sock.readMessages(\[msg.key\])  
   *(Wajib tandai "read" sebelum mengetik balasan)*  
4. **Typing Simulation:**  
   await sock.sendPresenceUpdate('composing', jid)  
   *(Muncul "typing..." di HP lawan)*  
5. **Variable Delay (PENTING):**  
   await delay(text.length \* 50 \+ random(500, 1000))  
   *(Hitung durasi mengetik: \~50ms per karakter. Jangan fix time)*  
6. **Eksekusi Kirim:**  
   await sock.sendMessage(jid, { text: '...' })  
7. **Cooldown:**  
   await sock.sendPresenceUpdate('paused', jid)

---

### **2\. Checklist Konfigurasi Socket (makeWASocket)**

Pengaturan ini hanya dilakukan sekali saat inisialisasi, namun krusial untuk menentukan "Sidik Jari" bot.

**Browser Identity (Wajib Ubah):**  
Jangan gunakan default. Samarkan sebagai OS Desktop.  
browser: Browsers.macOS('Chrome') // atau \['Ubuntu', 'Chrome', '20.0.0'\]

* **Presence Management:**  
  markOnlineOnConnect: false  
  *(Agar bot tidak online 24 jam non-stop. Online hanya saat pipeline berjalan)*  
* **Sync Strategy:**  
  syncFullHistory: false  
  *(Mencegah request data history massive yang mencurigakan saat login awal)*  
* **Session Management:**  
  Gunakan useMultiFileAuthState.  
  *(Database atau File System terpisah. Jangan in-memory)*

---

### **3\. Monitoring Event (Safety Kill Switch)**

Pasang *listener* pada event berikut untuk menghentikan bot secara otomatis jika terdeteksi anomali.

| Event | Tindakan Wajib |
| :---- | :---- |
| connection.update | Jika lastDisconnect error, **STOP** antrian broadcast. Jangan paksa reconnect loop cepat. |
| messages.upsert | Gunakan untuk trigger readMessages. Jangan biarkan tumpukan pesan *unread*. |
| messaging-history.set | **Tunggu** event ini selesai (isLatest: true) sebelum memulai broadcast pertama kali. |

---

### **4\. Prosedur Recovery (Jika Terkena Banned)**

Jika akun terblokir, lakukan **Deep Clean** sebelum memasukkan nomor baru. Data lama \= Jejak lama.

1. **Hapus Folder Sesi Total:**  
   rm \-rf auth\_info\_folder (Hapus folder fisik, bukan cuma isinya). Ini membuang *Pre-Keys* yang sudah ditandai server.  
2. **Ganti IP Address:**  
   Restart Modem/Router atau ganti Proxy. Server WA melacak IP "kotor".  
3. **Rotasi User Agent:**  
   Ubah config browser di kode. (Misal: Dari 'Chrome' ganti ke 'Firefox').  
4. **Warming Up (Pemanasan):**  
   * Hari 1-2: Chat manual via HP (Join grup, chat teman).  
   * Hari 3: Sambungkan Baileys, tapi **hanya** untuk *auto-reply* (bukan broadcast).  
   * Hari 4+: Mulai broadcast kecil (5-10 orang) dengan delay tinggi.

**Saran Terakhir:** Selalu gunakan *Jitter* (angka acak) pada setiap delay. Jangan pernah menggunakan angka bulat (misal: persis 5000ms) berulang-ulang.

