# Satuinbox - Feature List

Dokumen ini adalah versi gabungan dari `satuinbox-feature-list.md` dan `satuinbox feeature list 2.md`, berdasarkan pembacaan repo BE `omnichannel-satuinbox-be` dan FE `omnichannel-satuinbox-fe`.

## Ringkasan Domain

| Domain | Cakupan utama |
|---|---|
| Auth & onboarding | Akun, verifikasi, reset password, onboarding organisasi, approval company |
| Omnichannel inbox | Conversation multi-channel, chat room, assignment, bulk action, SLA |
| Ticketing | Ticket lifecycle, workflow, custom field, bulk reply, SLA, CSAT, export |
| Contacts & sales | Contact, lead, visit, komentar, duplicate handling, area sales/operational |
| Broadcast | Campaign WhatsApp, template, schedule, bulk upload, retry, analytics |
| Channel & widget | WhatsApp Web/API, Email, Instagram, Messenger, Telegram add-on, livechat widget |
| Analytics | Conversation, ticket, responsiveness, member performance, CSAT, broadcast, offline report |
| Settings | Organization, member, role, shift, tag, macro, team inbox, assignment, webhook |
| Billing | Subscription, invoice, wallet/token, voucher, quota, auto-renewal |
| Developer & audit | API key, Open API, webhook, request log, audit, media token, transcript token |

---

## 1. Autentikasi, Akun, dan Onboarding

Fitur untuk akses user, registrasi awal, dan validasi organisasi.

- Login dan logout.
- Register akun baru.
- Verifikasi email untuk owner dan member.
- Reset password dan set password baru.
- Ganti password dari settings.
- Refresh session/token untuk menjaga user tetap login.
- Onboarding organisasi setelah register.
- Input dan upload dokumen organisasi seperti NIB, KTP, dan NPWP.
- Status onboarding/waiting approval setelah dokumen dikirim.
- Approval atau reject company oleh admin/system.
- Invite member baru dan verifikasi undangan member.

---

## 2. User, Member, Role, dan Permission

Fitur untuk mengatur orang internal yang memakai Satuinbox.

- Manajemen member: list member, invited member, invite, resend invite, revoke invite, edit member, dan remove member.
- Pengaturan role member.
- Pengaturan shift member.
- Pengaturan status agent seperti active dan away.
- Away reason untuk alasan agent tidak tersedia.
- Pengaturan max conversation per agent.
- Opsi agent menerima chat di luar working hours.
- Role based access control (RBAC) untuk akses menu dan aksi fitur.
- Privacy setting per role.
- Privacy masking untuk email dan nomor telepon berdasarkan permission.

---

## 3. Omnichannel Inbox dan Conversation List

Fitur utama untuk menerima dan mengelola percakapan dari banyak channel.

- Inbox multi-channel: WhatsApp Web, WhatsApp API, Instagram, Facebook Messenger, Email, livechat widget, dan group chat.
- Section inbox seperti your inbox/mine, all, unassigned, starred, spam, dan junk.
- Filter dan sorting conversation berdasarkan status, channel, tag, assignee, team inbox, tanggal, dan parameter lain.
- Channel filter untuk Email, Instagram, WhatsApp API, WhatsApp Web, Widget, dan group.
- Team inbox untuk mengelompokkan channel, member, icon/color, dan routing conversation.
- Conversation count, pull, history, dan event realtime.
- Akses conversation berbasis role, team, channel, dan area operasional/sales.
- Real-time event melalui WebSocket untuk conversation, ticket, dan notification.

---

## 4. Conversation Management

Fitur untuk mengatur lifecycle dan metadata percakapan.

- Assign dan unassign conversation ke agent atau team.
- Close dan reopen conversation.
- Archive conversation.
- Mark as read dan unread.
- Star dan unstar conversation.
- Pin dan unpin conversation.
- Tandai sebagai spam atau junk.
- Snooze conversation dengan reminder.
- Bulk actions untuk assign, close/reopen, read/unread, star/unstar, pin/unpin, spam, junk, delete, dan snooze.
- Tambah dan hapus tag pada conversation.
- Internal notes per conversation.
- Participant management dan group member view.
- Conversation detail berisi client data, custom attributes, session detail, linked tickets, tracking, pinned messages, screenshots, media/files, notes, history, dan events.
- Buat ticket dari conversation, message, atau conversation bubble.
- Ganti account/channel pengirim dalam conversation jika tersedia.
- Message utilities seperti timestamp range dan data pendukung message.

---

## 5. Chat Room dan Message Handling

Fitur interaksi agent dengan customer di dalam chat room.

- Kirim dan terima pesan teks.
- Kirim dan terima media seperti gambar, dokumen, video, dan audio.
- Attachment upload dari chat.
- Emoji picker.
- Reply message.
- Edit message.
- Delete message.
- Copy message.
- Pin message.
- Retry message yang gagal terkirim.
- Typing indicator.
- Template pesan atau quick reply.
- Macro message dengan trigger `/`.
- Group message handling.
- Instagram comment thread handling.
- Screenshot conversation.
- Lihat media dan file yang pernah dikirim di conversation.

---

## 6. Ticketing dan Helpdesk

Fitur ticket untuk follow-up issue customer secara terstruktur.

- Buat, lihat, edit, dan hapus ticket.
- Create ticket manual.
- Create ticket dari conversation, message, atau conversation bubble.
- Draft ticket.
- Ticket list dengan search dan filter.
- Filter ticket berdasarkan status, channel, priority, agent, tag, team, stage, custom field, tanggal, dan sorting.
- Ticket status seperti open, closed, resolved, dan status lain sesuai konfigurasi.
- Priority ticket.
- Assign ticket ke agent atau team.
- Ticket type yang bisa dikustomisasi.
- Ticket stage/pipeline/kanban.
- Custom attributes/custom fields untuk ticket.
- View settings untuk konfigurasi tampilan kolom ticket.
- Edit deskripsi ticket.
- Linked conversation dan linked messages.
- Kirim dan hapus message/media dalam ticket.
- Media/files di detail ticket.
- Ticket reminder.
- Tag ticket.
- Snooze dan unsnooze ticket.
- Bulk resolve.
- Bulk add/remove tag.
- Bulk snooze/unsnooze.
- Bulk reply ticket dari XLSX/job.
- Report bulk reply, cancel job, dan status job.
- Export ticket.
- KPI ticket.
- SLA breakdown ticket.
- Responsiveness chart dan summary ticket.
- CSAT per ticket.
- Ticket tracking/audit trail aktivitas.
- Shipment tracking yang terhubung dengan ticket.

---

## 7. Contacts atau People

Fitur database customer/contact.

- Manajemen client contact.
- Buat, lihat, edit, dan hapus contact.
- Filter dan search contact.
- Add contact untuk kebutuhan operational atau sales.
- Duplicate check dan duplicate handling.
- Contact references.
- Riwayat conversation per contact.
- Detail contact berisi data customer dan konteks terkait.
- Send message dari contact.
- Import atau sinkronisasi contact.
- Area visibility untuk operational dan sales.

---

## 8. Leads dan Sales CRM

Fitur sales untuk prospek, pipeline, dan aktivitas lapangan.

- Manajemen leads/prospek.
- Lead list dengan pipeline tabs.
- Buat, lihat, dan edit lead.
- Create lead dari existing contact, new contact, atau tanpa contact.
- Change team inbox pada lead.
- Data company dan contact pada lead.
- Deskripsi lead.
- Komentar internal per lead.
- Accessible contact IDs untuk pembatasan akses.
- Visit history untuk prospect, existing, dan rejected.
- Create visit.
- Check-in visit.
- Duplicate warning saat create visit/contact.
- Detail visit.
- Approve dan reject visit.
- Status visit.

---

## 9. Broadcast dan Campaign

Fitur untuk mengirim campaign/broadcast massal.

- Dashboard broadcast messages.
- List broadcast dan summary broadcast.
- Buat broadcast baru.
- Bulk broadcast dari upload file.
- Pilih channel WhatsApp Web atau WhatsApp API.
- Pilih sender account.
- Pilih recipient dari contact, manual input, atau area.
- Tulis manual message atau pilih template.
- Variable samples untuk template.
- Schedule send now atau custom schedule.
- Save draft dan edit draft.
- Send broadcast.
- Retry broadcast sampai customer reply pada skenario yang didukung.
- Broadcast status update.
- Dead letter queue untuk broadcast gagal.
- Broadcast analytics dan export.
- Wallet/token deduction untuk penggunaan broadcast.

---

## 10. Broadcast Template

Fitur pengelolaan template pesan broadcast.

- List template.
- Create template.
- Edit template.
- Delete template.
- Submit template untuk approval/review.
- Submit WhatsApp API template ke Meta.
- Konfigurasi language, category, header, body, dan variables.
- Spin text untuk variasi pesan.
- Approval status template.

---

## 11. Channel dan Account Integration

Fitur integrasi account/channel yang dipakai inbox dan broadcast.

- Master data platform/channel.
- Account channel CRUD.
- Bulk operation account channel.
- Restore account channel.
- Account channel group.
- Main account selection.
- WhatsApp Web QR connect.
- WhatsApp Web session management.
- WhatsApp Web reserved account.
- WhatsApp Web stats.
- Rename, move, delete, dan set main account untuk WhatsApp Web.
- WhatsApp API setup.
- WhatsApp API OAuth/embedded signup.
- WhatsApp API account setup dan webhook.
- WhatsApp API message template integration.
- Email integration dengan IMAP/SMTP.
- Test dan connect Email IMAP/SMTP.
- Instagram OAuth dan webhook untuk DM/comment.
- Facebook Messenger OAuth dan webhook.
- Telegram add-on terlihat di UI.

---

## 12. Livechat Widget dan Public Customer Flow

Fitur widget chat yang dipasang di website customer.

- Public livechat widget.
- Home/greeting screen.
- Resume atau continue chat session.
- Topic dan subtopic selection.
- Default form dan custom form.
- Conversation list di widget.
- Chat room widget dengan text, emoji, attachment, reply, media, dan CSAT bubble.
- Bottom navigation home/message.
- Guest token dan session email untuk resume session.
- Remove session.
- Public JS API `$satuinbox` untuk show, hide, toggle, destroy, set session, remove session, marketplace command, dan livechat command.
- Public transcript read-only via token.
- Public CSAT survey via token.
- Ticket route di widget terlihat ada, tetapi bottom nav ticket dikomentari.

---

## 13. Widget Settings

Fitur admin untuk mengatur tampilan dan perilaku livechat widget.

- Branding widget.
- Theme/color setting.
- Logo setting.
- Launcher setting.
- Text/content setting.
- Whitelabel setting.
- Sound setting.
- Email transcript setting.
- Widget form default dan custom field.
- Widget account management.
- Topic dan subtopic CRUD.
- Away mode.
- Public widget settings.
- Install docs dan install script.
- Livechat transcript email/webhook.

---

## 14. Analytics, Statistik, dan Reporting

Fitur dashboard performa dan laporan.

- Analytics untuk Conversations, Ticket, Responsiveness, Member Performance, Broadcast, dan Offline Report.
- Total metrik conversation.
- Daily conversation.
- Conversation per platform/channel.
- Replies by time.
- Tags frequency.
- Reply metrics.
- Screenshot metrics.
- Ticket performance.
- Ticket distribution.
- Ticket SLA/FRT/reply/per-hour/per-week.
- Responsiveness ART, AFRT, ATTC, dan SLA breakdown.
- Member performance overview.
- CSAT statistik per agent, cards, trend, distribusi, dan response history paginated.
- Broadcast delivery stats.
- Broadcast summary.
- Export report job.
- Offline report request untuk ticket, conversation, dan broadcast.
- Filter report, status report, retry, dan download.
- Pre-aggregation berkala, backfill, dan metadata last updated di backend.

---

## 15. SLA dan Responsiveness

Fitur pengukuran dan pengingat performa layanan.

- Conversation SLA.
- First Response Time (FRT).
- Response/Reply Lead Time (RLT) jika tersedia di UI.
- Time to Close (TTC).
- Ticket SLA per stage.
- Office hours snapshot.
- Per-channel SLA override.
- Pause SLA saat waiting customer atau AUX.
- SLA reminder.
- Breach notification.
- Safety cron/evaluation cron untuk evaluasi SLA.

---

## 16. CSAT dan Customer Feedback

Fitur survey kepuasan customer.

- CSAT untuk conversation.
- CSAT untuk ticket.
- Public one-time token CSAT link.
- Public CSAT submit.
- Konfigurasi CSAT per company/channel.
- Live preview CSAT setting.
- Auto-ticket setting terkait CSAT jika tersedia.
- CSAT statistics dan response analytics.

---

## 17. Notification

Fitur notifikasi aplikasi dan email system.

- In-app notification center.
- Notification realtime via socket.
- Tab/filter primary dan updates.
- Filter all, unread, dan read.
- Search notification.
- Filter tipe notification seperti billing, wallet, conversation, dan ticket.
- Mark notification read/unread.
- Mark all as read.
- Delete notification.
- Email template untuk register, invite, reset password, token alert, payment, plan, subscription reminder, dan comeback schedule.

---

## 18. Settings - Organization

Fitur pengaturan organisasi/perusahaan.

- General company settings seperti nama, logo, language, dan data perusahaan.
- API key management dari settings.
- Organization profile update.
- Member management.
- Role dan permission management.
- Privacy masking config.
- Shift hours default dan member-specific.
- Working hour config.
- Tag management active/archive.
- Away reason management.
- Change password.

---

## 19. Settings - Inbox dan Workflow

Fitur pengaturan operasional inbox dan ticket.

- Team inbox create/edit dengan channel, members, icon, dan color.
- Assignment rules.
- Round-robin assignment.
- Away reason untuk assignment flow.
- Macros untuk otomasi/quick action.
- General conversation SLA setting.
- CSAT setting per channel.
- Ticket type setting.
- Ticket stage setting.
- Ticket custom fields/custom attributes.
- SLA reminder untuk ticket workflow.

---

## 20. Settings - Developer, Webhook, dan Shipping

Fitur teknis untuk integrasi eksternal.

- Webhook ticket status.
- Webhook livechat transcript.
- Test webhook endpoint.
- Activate/deactivate webhook.
- Shipping credentials CRUD.
- Vendor shipping/logistic credential.
- Environment dan status credential.
- Shipment tracking support pada ticket.

---

## 21. API, Open API, dan Audit Log

Fitur akses eksternal dan observability.

- API key generation dan validation.
- Partner Open API berbasis API key.
- Request logging untuk partner Open API.
- Open API audit log.
- Log method, path, body, response, status, duration, IP, user-agent, API key identifier, dan correlation ID.
- Retention/TTL untuk audit log.

---

## 22. Billing, Subscription, Wallet, dan Quota

Fitur komersial dan pembayaran.

- Billing summary.
- Invoice list.
- Invoice detail.
- Pay invoice.
- Export invoice/payment data.
- Payment method.
- Payment bill webhook.
- Manage package plan.
- Add-on package.
- Voucher validation.
- Proration/prorata saat perubahan paket.
- Confirmation flow untuk perubahan paket.
- Subscription create.
- Subscription cancel.
- Manual expire subscription.
- Auto-renewal.
- Downgrade transition.
- Billing cycle dan upcoming bill.
- Wallet balance/token balance.
- Top up token.
- Wallet/topup history.
- Wallet transactions.
- Quota usage monitoring.
- Monthly broadcast quota reset.
- Wallet deduction untuk broadcast.

---

## 23. Media, File Sharing, dan Transcript

Fitur file/media dan akses publik terbatas.

- Upload media.
- Get media.
- Stream media.
- Delete media.
- Shared media token generate.
- Resolve shared media token.
- Revoke shared media token.
- Public transcript token.
- Public transcript read-only page.
- Livechat transcript webhook/email.
- Continue-chat token.

---

## 24. Ringkasan Microservices Backend

| Service | Fungsi utama |
|---|---|
| `api-gateway` | Entry point REST API, Open API, guard, routing ke services, WebSocket gateway |
| `auth-service` | Autentikasi, token, role, permission |
| `analytics-service` | Statistik conversation, ticket, member, CSAT, broadcast, offline report |
| `audit-service` | Audit log dan Open API request log |
| `broadcast-service` | Broadcast, template, schedule, retry, analytics/export |
| `channel-service` | Platform/channel dan account channel |
| `company-service` | Company, organization settings, shift, tag, CSAT config, shipping |
| `conversation-service` | Conversation, message, SLA, CSAT, screenshot, transcript |
| `email` | Integrasi Email IMAP/SMTP |
| `instagram` | Integrasi Instagram DM/comment |
| `media-service` | Upload, stream, shared media token |
| `messenger` | Integrasi Facebook Messenger |
| `notification-service` | In-app dan email notification |
| `payment-service` | Subscription, invoice, wallet, voucher, quota, auto-renewal |
| `people-service` | Member, team, contact, contact area context |
| `sales-service` | Leads, visits, comments |
| `ticket-service` | Ticket, ticket workflow, SLA, CSAT, tracking, bulk reply |
| `whatsapp` | WhatsApp Web session/QR/account |
| `whatsapp-api` | WhatsApp Cloud API/OAuth/template/webhook |
| `widget` | Livechat widget, setting, topic/subtopic, public session |

---

## 25. Catatan Status Implementasi FE

Beberapa bagian frontend terlihat masih placeholder atau parsial saat pembacaan repo.

- Route contact tertentu masih placeholder.
- Payment details subscription masih placeholder.
- WhatsApp API setting page terlihat menggunakan dummy/stub data.
- Ticket route pada widget ada indikasi belum aktif penuh karena bottom nav ticket dikomentari.
