# Satuinbox — Feature List

> Dihasilkan dari analisis repo BE (`omnichannel-satuinbox-be`) dan FE (`omnichannel-satuinbox-fe`)

---

## 1. Autentikasi & Akun

- Login / Logout
- Register akun baru
- Onboarding (setup awal setelah register)
- Reset password & set password baru
- Verifikasi email (member & owner)
- Ganti password (dari settings)
- Manajemen role & permission (RBAC)
- Privacy settings per role

---

## 2. Conversation (Omnichannel Inbox)

- Inbox percakapan multi-channel (WhatsApp Web, WhatsApp API, Instagram, Facebook Messenger, Email, Widget)
- Filter & sorting percakapan (status, channel, tag, assignee, dll)
- Assign / unassign percakapan ke agent atau tim
- Kirim & terima pesan teks, media (gambar, file, video, audio)
- Edit & hapus pesan
- Pin pesan
- Template pesan (quick reply)
- Catatan internal (notes) per percakapan
- Screenshot percakapan
- Riwayat percakapan (conversation history)
- Ganti channel akun dalam percakapan
- Tandai bintang (star) percakapan
- Buka ulang (reopen), tutup (close), arsip, spam, junk percakapan
- Snooze percakapan (dengan pengingat/reminder)
- Tambah / hapus tag pada percakapan
- Buat konversi percakapan ke tiket
- Lihat media dalam percakapan
- Message utilities (timestamp range, dll)
- Real-time event (WebSocket)
- Bulk actions (hapus, snooze, dll)
- Conversation SLA — tracking First Response Time (FRT) & Time to Close (TTC)
- Akses percakapan berdasarkan section (all, mine, unassigned, dll)

---

## 3. Ticketing

- Buat, lihat, edit, hapus tiket
- Assign tiket ke agent / tim
- Status tiket (open, closed, dll)
- Tipe tiket (ticket type) — kustomisasi
- Stage tiket (pipeline/kanban)
- View settings tiket (konfigurasi tampilan kolom)
- Kirim & hapus pesan dalam tiket
- Bulk reply tiket
- Snooze & unsnooze tiket (bulk)
- Export tiket
- CSAT per tiket
- SLA breakdown tiket
- Responsiveness chart & summary tiket
- Tracking tiket (audit trail aktivitas)

---

## 4. Broadcast

- Buat & kirim pesan broadcast (bulk messaging)
- Draft broadcast (simpan & edit sebelum kirim)
- Jadwalkan pengiriman broadcast
- Template broadcast (buat, edit, hapus, approval)
- Summary / statistik broadcast (delivered, read, replied, dll)
- Analitik broadcast

---

## 5. Contacts (People)

- Manajemen kontak pelanggan (client contact)
- Buat, lihat, edit, hapus kontak
- Riwayat percakapan per kontak
- Import / sinkronisasi kontak

---

## 6. Leads (Sales)

- Manajemen leads / prospek
- Buat, lihat, edit leads
- Kunjungan / visit per lead (tracking aktivitas sales)
- Komentar internal per lead

---

## 7. Channels & Integrasi

- **WhatsApp Web** — setup & manajemen akun
- **WhatsApp API (Cloud API)** — setup, account setup, message templates, webhook
- **Instagram** — webhook & integrasi DM
- **Facebook Messenger** — webhook & integrasi
- **Email** — integrasi email channel
- **Web Widget** — live chat widget untuk website
  - Setting widget (tampilan, warna, dll)
  - Topic / kategori widget
- **Addon** — channel tambahan
- Account Channel Group — pengelompokan channel

---

## 8. Statistik & Analitik

- Total metrik percakapan
- Percakapan harian (daily conversation)
- Percakapan per platform / channel
- Balasan berdasarkan waktu (replies by time)
- Frekuensi tag (tags frequency)
- Reply metrics
- Screenshot metrics
- Performa agent (member performance)
- CSAT statistik (per agent: cards, trend, distribusi)
- Riwayat respons CSAT (paginated)
- Responsiveness analytics (chart & summary)
- Ticket analytics
- Export laporan (export report job)

---

## 9. Notification

- Notifikasi real-time dalam aplikasi
- Manajemen notifikasi (baca, hapus)

---

## 10. Settings — Inbox

- **Assignments** — aturan auto-assign percakapan
- **CSAT** — konfigurasi Customer Satisfaction survey
- **Macros** — otomasi tindakan berulang
- **SLA** — pengaturan SLA (First Response Time, Time to Close) per channel
- **Team Inbox** — buat & kelola team inbox
- **Tickets** — konfigurasi tipe tiket

---

## 11. Settings — Organization

- General settings perusahaan (nama, logo, dll)
- Manajemen member (undang, edit, nonaktifkan)
- Manajemen role & permission
- Shift hours (jam operasional) — buat & edit
- Manajemen tag
- Away reason (alasan agen tidak tersedia)

---

## 12. Settings — Developer

- Webhook (konfigurasi outgoing webhook)
- Shipping credentials (integrasi shipping/logistik)

---

## 13. Subscription & Pembayaran

- Manajemen paket langganan (manage package)
- Billing & detail pembayaran
- Wallet (saldo)
- Voucher
- Quota usage (monitoring penggunaan kuota)

---

## 14. Media

- Upload & kelola media (gambar, dokumen, video, audio)
- Generate token akses media

---

## 15. Audit

- Audit log aktivitas sistem (audit-service)

---

## Ringkasan Microservices BE

| Service | Fungsi Utama |
|---|---|
| `api-gateway` | Entry point semua request, routing ke services |
| `auth-service` | Autentikasi, role/permission |
| `analytics-service` | Laporan & statistik percakapan, agent, broadcast |
| `audit-service` | Audit log |
| `broadcast-service` | Kirim & kelola broadcast |
| `channel-service` | Manajemen channel & platform |
| `company-service` | Pengaturan perusahaan, shift, tag, shipping |
| `conversation-service` | Percakapan, pesan, CSAT, SLA, screenshot |
| `email` | Integrasi email |
| `instagram` | Integrasi Instagram DM |
| `media-service` | Upload & akses media |
| `messenger` | Integrasi Facebook Messenger |
| `notification-service` | Notifikasi in-app |
| `payment-service` | Subscription, wallet, voucher, quota |
| `people-service` | Member, tim, kontak, metrik agent |
| `sales-service` | Leads, kunjungan, komentar |
| `ticket-service` | Tiket, SLA, CSAT, tracking |
| `whatsapp` | Integrasi WhatsApp Web |
| `whatsapp-api` | Integrasi WhatsApp Cloud API |
| `widget` | Live chat widget |
