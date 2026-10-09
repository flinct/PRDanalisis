# SatuInbox — Daftar Fitur & Action (code-verified)

> Sumber: `omnichannel-satuinbox-fe/apps/omnichannel`
> - Fitur/modul = route `app/[locale]/(main)/**/page.tsx`
> - Action = RBAC catalog `constants/rbac.ts` (`ConversationPermission`, `TicketPermission`, dst) + enum `types/rbac.ts` (`PermissionActionEnum` × `ResourceTypeEnum`)
>
> Semua baris di bawah traceable ke kode. Tidak ada yang dikarang.
> `pricing/tier belum ada di repo` — billing nyata metered (`RulePrice[]` per CHANNEL/AGENT/BROADCAST + `isUnlimited`). Pemetaan fitur→paket = placeholder.

---

## Scope visibility (RBAC)

Banyak action punya varian **scope** yang menentukan kategori tier:

| Suffix | Arti | Kategori umum |
|---|---|---|
| `own` | hanya milik sendiri | Basic |
| `team` | milik tim/team-inbox | Premium |
| `all` / `*` | semua data organisasi | Premium |
| `read_client_data`, `view_full_email`, `view_full_phone` | data sensitif kontak (privacy) | Premium |

`Role.contactScope`: `areaScope` = all \| operational \| sales; `visibilityScope` = all \| own_and_assigned \| team.

> ⚠️ Kolom **Kategori** = USULAN (tier belum ada di repo; billing nyata metered `RulePrice[]`). Dasar: pola scope RBAC (`own`=Basic, `team`/`all`=Premium), biaya operasional/infra, standar industri CS SaaS. Keputusan final = produk + Change Intake.

---

## 1. Conversation (Inbox) — `conversation`
Route: `(main)/conversation/[convoSection]`

| Action | Kategori | Permission code |
|---|---|---|
| Baca percakapan | Basic | `conversation:read` |
| Kirim pesan | Basic | `conversation:send_message` |
| Ubah status (open/pending/resolved) | Basic | `conversation:change_status` |
| Reopen percakapan | Basic | `conversation:reopen` |
| Mark read | Basic | `conversation:mark_read` |
| Star / tandai | Basic | `conversation:star` |
| Pin percakapan | Basic | `conversation:pin_convo` |
| Pin pesan | Basic | `conversation:pin_message` |
| Kelola catatan internal (notes) | Basic | `conversation:manage_notes` |
| Kelola macro di percakapan | Basic | `conversation:manage_macros` |
| Kelola assignee (assign/transfer agent) | Premium | `conversation:manage_asignee` |
| Pull / ambil percakapan (self-serve) | Premium | `conversation:pull` |
| Lihat data klien | Premium | `conversation:read_client_data` |
| Mark spam | Premium | `conversation:mark_spam` |
| Ambil screenshot | Premium | `conversation:take_screenshot` |
| Kelola custom attribute (collection/field) | Premium | `conversation:change_status` *(mapping repo menunjuk change_status)* |

## 2. Ticket — `ticket`
Route: `(main)/ticketing`, setting `(main)/settings/inbox/tickets`

| Action | Kategori | Permission code |
|---|---|---|
| Baca tiket | Basic | `ticket:read` |
| Buat tiket | Basic | `ticket:create` |
| Update tiket | Basic | `ticket:update` |
| Kirim pesan di tiket | Basic | `ticket:send_message` |
| Close sendiri | Basic | `ticket:close_own` |
| Reopen sendiri | Basic | `ticket:reopen_own` |
| Assign tiket | Premium | `ticket:assign` |
| Hapus tiket | Premium | `ticket:delete` |
| Close — all / team | Premium | `ticket:close_all` / `close_team` |
| Reopen — all / team | Premium | `ticket:reopen_all` / `reopen_team` |
| Ticket Type (CRUD) | Premium | `ticket_type:` create/read/update/delete |

## 3. Broadcast — `broadcast`
Route: `(main)/broadcast/messages`, `/templates`, `/draft`

| Action | Kategori | Permission code |
|---|---|---|
| Baca broadcast | Basic | `broadcast:read` |
| Buat broadcast (kuota terbatas) | Basic | `broadcast:create` |
| Update broadcast, template, draft | Basic | `broadcast:update` |
| Baca broadcast tim | Premium | `broadcast:read_team` |
| Hapus broadcast | Premium | `broadcast:delete` |

## 4. Contact — `client_contact`
Route: `(main)/contacts`, `(main)/contact`

| Action | Kategori | Permission code |
|---|---|---|
| Baca kontak sendiri | Basic | `client_contact:read_own` |
| Buat kontak | Basic | `client_contact:create` |
| Update kontak | Basic | `client_contact:update` |
| Baca kontak (all) | Premium | `client_contact:read` |
| Baca kontak tim | Premium | `client_contact:read_team` |
| Hapus kontak | Premium | `client_contact:delete` |
| Sync kontak pihak ketiga | Premium | `client_contact:sync_contact_third_party` |

## 5. Lead / Sales — `lead` + `visit`
Route: `(main)/leads`, `(main)/leads/[id]`

| Action | Kategori | Permission code |
|---|---|---|
| Baca lead sendiri | Basic | `lead:read_own` |
| Buat lead | Basic | `lead:create` |
| Update lead sendiri | Basic | `lead:update_own` |
| Baca lead — all / team | Premium | `lead:read` / `read_team` |
| Update lead — team | Premium | `lead:update_team` |
| Hapus lead | Premium | `lead:delete` |
| Pindah team inbox | Premium | `lead:change_team_inbox` |
| Buat kunjungan | Premium | `visit:create` |
| Check-in kunjungan | Premium | `visit:check_in` |
| Baca kunjungan — own / team / all | Premium | `visit:read_own` / `read_team` / `read` |
| Approve kunjungan | Enterprise | `visit:approve` |
| Reject kunjungan | Enterprise | `visit:reject` |

## 6. Statistic / Analytics — `statistic`
Route: `(main)/statistic` — dimensi: Conversation, Ticket (`useResponsivenessSection`)

| Action | Kategori | Permission code |
|---|---|---|
| Baca statistik sendiri | Basic | `statistic:read_own` |
| Baca statistik — team / all | Premium | `statistic:read_team` / `read` |
| Export statistik | Premium | `statistic:export` |

## 7. Channel — `account_channel`
Route: `(main)/settings/channels/{whatsapp-web, whatsapp-api, widget, addon}`

| Action | Kategori | Permission code |
|---|---|---|
| Baca channel | Basic | `account_channel:read` |
| Kelola WhatsApp Web | Basic | `setting:manage_whatsapp_web` |
| Kelola Live Chat / Widget | Basic | `setting:manage_live_chat` / `setting:manage_widget` |
| Tambah channel | Premium | `account_channel:create` |
| Update channel | Premium | `account_channel:update` |
| Hapus channel | Premium | `account_channel:delete` |
| Kelola add-ons channel (WA Business API, multi-channel) | Premium | `setting:manage_addons` |

## 8. Inbox Settings — `setting`
Route: `(main)/settings/inbox/{assignments, csat, macros, sla, team-inbox}`

| Action | Kategori | Permission code |
|---|---|---|
| Macro personal | Basic | `macro:` create/read/update/delete |
| Shared macro | Premium | `setting:manage_shared_macro` |
| Team inbox | Premium | `setting:manage_team_inbox` |
| Assignment / auto-routing | Premium | `assignment:read` (+ `assignment:*`) |
| SLA policy | Premium | `setting:manage_sla` |
| CSAT survey | Premium | `setting:csat` |

CSAT publik: route `csat/[token]` (survey end-customer).

## 9. Organization Settings
Route: `(main)/settings/organization/{general, members, roles, roles/privacy-settings, shift-hours, tags, change-password}`

| Action | Kategori | Permission code |
|---|---|---|
| General setting | Basic | `setting:manage_general_setting` / `company:update` |
| Tags | Basic | `setting:manage_tags` |
| Member (jumlah terbatas) | Basic | `member:` create/read/update/delete, `setting:manage_member` |
| Role & permission (custom role) | Premium | `roles:read` / `roles:*` |
| Privacy (unmask email/phone) | Premium | `privacy:view_full_email` / `privacy:view_full_phone` |
| Shift hours | Premium | `shift_hours:` create/read/update/delete |
| API key | Premium | `company:read_api_key` / `company:create` |
| Member skala besar | Enterprise | (quota) |

## 10. Developer
Route: `(main)/settings/developer/{webhook, sync-contact, shipping-credentials}`

| Action | Kategori | Permission code |
|---|---|---|
| Webhook | Premium | `setting:manage_webhook` |
| Sync contact | Premium | `setting:manage_sync_contact` / `client_contact:sync_contact_third_party` |
| Shipping credentials | Premium | `setting:manage_shipping` |
| Open API publik (**belum ada**) | Enterprise | — |

## 11. Subscription / Billing — `subscription` + `setting`
Route: `(main)/settings/subscriptions/{billing, manage-package, payment-details}`

| Action | Kategori | Permission code |
|---|---|---|
| Kelola subscription, billing, payment | Basic | `setting:manage_subscription` / `subscription:*` |

Billing nyata: metered quota per `RulePrice.type` (CHANNEL / AGENT / BROADCAST), `isUnlimited`, `pricePerUnit` (Google Money proto).

## 12. Fitur & Kapasitas BELUM ADA di repo (perlu dibuat)
Verified by search (`constants/rbac.ts`, route, grep repo FE 2026-10-02) — tidak ditemukan.

### 12a. Fitur fungsional belum ada

| Action | Kategori | Permission code | Catatan verifikasi |
|---|---|---|---|
| Global Search (cross-module) | Premium | — | tak ada resource/action `search`; hanya filter per-list per modul. Butuh index terpisah (ala Discord/Elasticsearch) → beban infra, wajar Premium+ |
| Open API + dokumentasi (portal developer eksternal) | Enterprise | — | hanya API key internal + webhook, bukan portal berdokumentasi |
| Collaborator role (watcher/cc di percakapan) | Premium | — | grep `collaborator` = 0 match |
| Snooze **Conversation** | Premium | — | hanya Ticket Snooze yang ada (`ticket-snooze.constant.ts`); conversation snooze = 0 match |
| Conversation Hold state | Premium | — | tak ada enum hold di conversation status/state |
| Auto-reply | Premium | — | grep `auto.?reply` = 0 match |
| Anti-spam system (conversation) | Premium | — | grep `anti.?spam` = 0; hanya `conversation:mark_spam` manual |
| Room reminder | Basic | — | hanya placeholder comment di `conversation.service.ts` (API belum ada) |

> Sudah ada (bukan backlog — koreksi atas AGENTS.md yang stale): Ticket Snooze, Related Conversations (`RelationLabelSection.tsx`), WA Group Mention + @All large-group warning (`ChatRoomMentionSection.tsx`, `use-mention-autocomplete.ts`).

### 12b. Lever kapasitas/infra belum ada (pembeda tier berbasis biaya)
Dari research `infra-retention-mau-traffic-research.md` + `storage-local-vs-cloud-messaging-research.md`. Ini **kuota/kapasitas**, bukan permission RBAC — belum ada enforcement di repo (billing nyata metered `RulePrice[]` per CHANNEL/AGENT/BROADCAST saja, tanpa retention/MAU/storage lever).

| Lever | Basic | Premium | Enterprise | Dasar biaya (sumber) |
|---|---|---|---|---|
| Data retention pesan/percakapan | 90 hari auto-purge | 12 bulan | konfigurable/unlimited | hot storage ~23x archive (S3 CloudZero); Zendesk 90d purge, Intercom 13mo |
| MAU (end-customer unik/bln) | kecil | menengah | kustom | model MAU tiered; CS SaaS ratio 10–20% |
| MUV (live-chat widget visitor/bln) | kecil | menengah | kustom | driver concurrency Socket.IO |
| Message/broadcast traffic (outbound/bln) | kuota kecil | kuota besar | unlimited/nego | WA per-message pass-through (Meta); RabbitMQ fan-out |
| Media/attachment storage | kuota kecil | menengah | kustom | object storage + CDN per GB + egress (S3/R2) |

> ⚠️ Semua angka = USULAN; kalibrasi butuh data infra internal (ukuran dokumen MongoDB, cost cluster, rate WA Indonesia).

> Semua item section 12 = kandidat Change Intake Brief (Phase 0) sebelum masuk PRD.

---

## Resource catalog lengkap (`ResourceTypeEnum`)
`audit, broadcast, chat, company, client_contact, conversation, member, organization, permission, roles, subscription, team, ticket, ticket_type, user, setting, shift_hours, statistic, account_channel, macro, assignment, lead, visit, comment, privacy`

## Action catalog lengkap (`PermissionActionEnum`)
`* (all_access), create, read, read_own, read_team, update, update_own, update_team, delete, execute, export, import, pin_convo, pin_message, star, assign, mark_read, mark_spam, read_client_data, read_api_key, manage_asignee, manage_macros, manage_notes, manage_general_setting, manage_member, manage_sla, manage_team_inbox, manage_live_chat, manage_whatsapp_web, manage_tags, manage_shared_macro, manage_webhook, manage_addons, manage_ticket_type, manage_shipping, manage_subscription, manage_sync_contact, sync_contact_third_party, manage_widget, take_screenshot, change_status, change_team_inbox, close_all, close_own, close_team, reopen, reopen_all, reopen_own, reopen_team, send_message, pull, csat, view_full_email, view_full_phone, approve, check_in, reject`

---

**Pola kategori:** Basic = scope `own` + core inbox/ticket + channel entry-level + tim kecil. Premium = scope `all`/`team` + automation (routing/SLA/CSAT) + WA Business API + analytics export + roles granular + integrasi + global search. Enterprise = approval flow + member skala besar + Open API/portal + kustom (hubungi sales).
