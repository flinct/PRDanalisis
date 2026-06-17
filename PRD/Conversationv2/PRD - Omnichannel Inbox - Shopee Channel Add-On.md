# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Omnichannel Inbox — Shopee Channel Add-On  
**Product Manager**: Dany Christian  
**Engineering Lead**: Naftal Yunior  
**Design Lead**: TBD  
**Contributors**: Engineering Team, QA Team, Design Team  
**Version**: v1.0  
**TRD**: TBD

---

## **1. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-06-17 | PRD Analysis → PRD | Initial PRD for Shopee Channel Add-On Phase 1 (Core Inbox) using existing SatuInbox omnichannel backbone. |

---

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Menambahkan Shopee sebagai channel add-on baru agar percakapan buyer–seller dapat masuk ke SatuInbox, diproses oleh agent dari unified inbox, dan mengikuti lifecycle conversation existing. |
| Scope | **Phase 1 only**: onboarding koneksi akun/toko Shopee, inbound text message, outbound text reply, sinkronisasi status dasar jika tersedia, filter channel, audit, dan observability. |
| Key Capabilities | Aktivasi Shopee sebagai add-on, koneksi akun/toko Shopee, inbound webhook processing, conversation/contact resolution, outbound reply dari room, channel filter `Shopee`, analytics dasar by platform, dan kontrol RBAC existing. |
| Outcome | Tenant dapat menangani chat Shopee langsung dari SatuInbox tanpa membuat integrasi manual di luar platform. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| Aktivasi Shopee sebagai add-on platform baru. | Sinkronisasi order, refund, return, shipping, dan catalog. |
| Koneksi satu atau lebih akun/toko Shopee per tenant sesuai model account-channel existing. | Broadcast massal ke Shopee. |
| Inbound text message Shopee ke Conversation Inbox. | AI semantic matching atau auto merge lintas channel. |
| Outbound text reply dari Conversation Room ke Shopee. | Attachment image, file, voice note, sticker, atau rich message pada Phase 1. |
| Penyimpanan metadata channel, buyer identity, thread identity, dan external message id. | Template message khusus Shopee. |
| Status dasar `sent` / `failed` dan callback tambahan bila API Shopee mendukung. | Ticket auto-creation khusus Shopee. |
| Filter dan analytics dasar by platform `Shopee`. | Dashboard operasional Shopee khusus di luar analytics existing. |
| Audit trail untuk connect, disconnect, inbound, outbound, dan failure penting. | Import histori percakapan lama Shopee. |

### **Phase Boundary**

Phase 1 sengaja dibatasi ke **Core Inbox** agar integrasi dapat dirilis dengan aman menggunakan arsitektur platform existing. Jika capability resmi Shopee untuk attachment, order context, atau status lanjutan telah tervalidasi, perubahan tersebut harus masuk sebagai patch/addendum PRD terpisah, bukan ekspansi diam-diam di tengah sprint.

---

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Tenant yang berjualan di Shopee harus berpindah antara Seller Center dan SatuInbox untuk menangani chat pelanggan. | Waktu respons lebih lambat dan konteks kerja agent terpecah. |
| PS-002 | Stack omnichannel SatuInbox sudah mendukung beberapa channel, tetapi belum memiliki integrasi Shopee. | Tenant tidak bisa menggunakan satu inbox untuk semua channel utama. |
| PS-003 | Channel marketplace tidak selalu memiliki identitas pelanggan berbasis nomor telepon. | Risiko duplikasi contact dan conversation tinggi jika identity model tidak dirancang khusus. |
| PS-004 | Webhook marketplace cenderung retryable, bursty, dan tidak selalu berurutan. | Tanpa idempotency dan ordering guard, duplicate message dan status drift dapat terjadi. |
| PS-005 | FE dan BE saat ini memiliki extension point generik untuk add-on channel, tetapi belum ada kontrak implementasi Shopee. | Tanpa PRD yang jelas, blast radius lintas channel, analytics, dan inbox behavior sulit dikontrol. |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Menghadirkan Shopee ke unified inbox SatuInbox. | 100% tenant pilot dapat menerima dan membalas chat Shopee dari inbox tanpa keluar dari SatuInbox. |
| Mengurangi fragmentasi penanganan percakapan marketplace. | ≥90% inbound Shopee valid berhasil dipetakan ke conversation yang benar dalam ≤30 detik. |
| Menjaga stabilitas backbone omnichannel existing. | 0 regresi P0 pada WhatsApp API, Instagram, Messenger, Email, dan Widget selama rollout pilot. |
| Menjamin integrasi aman di bawah retry dan duplicate webhook. | 0 duplicate conversation akibat retry webhook pada skenario idempotent yang tervalidasi QA. |
| Menyediakan dasar reusable untuk capability Shopee lanjutan. | Phase 2 dapat menambah attachment/order context tanpa mengganti model platform/channel/account-channel existing. |

---

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to connect a Shopee account/shop as a new add-on channel so that tenant dapat menerima chat Shopee di SatuInbox. | 1. Given tenant memiliki akses pengelolaan add-on, When Admin mengaktifkan Shopee dan menyelesaikan flow koneksi, Then system membuat account channel Shopee baru dalam scope tenant yang benar. 2. Given koneksi berhasil, When halaman settings dimuat ulang, Then account channel Shopee tampil dengan status terhubung. 3. Given kredensial atau otorisasi tidak valid, When proses koneksi gagal, Then system tidak membuat account channel aktif dan menampilkan alasan kegagalan yang aman. |
| US-002 | P0 | As an Agent, I want inbound Shopee messages to appear in Omnichannel Inbox so that I can handle them from the same workspace as channel lain. | 1. Given webhook inbound Shopee valid diterima, When buyer mengirim pesan baru, Then system membuat atau memperbarui conversation Shopee di inbox tenant yang benar. 2. Given buyer yang sama mengirim pesan lanjutan pada thread yang sama, When webhook diproses, Then system menambahkan message ke conversation Shopee yang sama. 3. Given webhook inbound adalah duplikat retry, When event diproses ulang, Then system tidak membuat duplicate conversation atau duplicate message. |
| US-003 | P0 | As an Agent, I want to reply to Shopee customers from Conversation Room so that I do not need to open Seller Center separately. | 1. Given conversation Shopee terbuka dan user memiliki permission kirim pesan, When Agent mengirim balasan text, Then system mengirim pesan ke Shopee dan menyimpan outbound message di timeline conversation. 2. Given pengiriman outbound gagal, When system menerima failure dari provider atau timeout final, Then message ditandai gagal dan agent melihat state kegagalan yang jelas. 3. Given user tidak memiliki izin kirim pesan, When room dibuka, Then composer Shopee tampil nonaktif atau tidak tersedia sesuai RBAC. |
| US-004 | P0 | As an Agent, I want Shopee conversations to be identifiable and filterable as a separate channel so that I can triage marketplace traffic quickly. | 1. Given channel Shopee aktif, When inbox dimuat, Then conversation Shopee membawa label channel `Shopee`. 2. Given user memfilter berdasarkan channel, When memilih `Shopee`, Then hanya conversation Shopee yang terlihat sesuai visibility scope user. 3. Given analytics by platform dimuat, When data Shopee tersedia, Then data Shopee ikut dihitung sebagai platform terpisah. |
| US-005 | P0 | As an Admin or Supervisor, I want Shopee account connection health to be visible so that operational issues bisa ditindaklanjuti cepat. | 1. Given account channel Shopee terhubung, When token/session masih valid, Then status tampil sebagai terhubung. 2. Given otorisasi kedaluwarsa atau koneksi diputus, When health check atau callback status diterima, Then status account channel berubah menjadi terputus dan audit event tercatat. 3. Given reconnect diperlukan, When Admin membuka settings channel, Then system menampilkan CTA untuk hubungkan ulang. |
| US-006 | P1 | As a Supervisor, I want Shopee events to be auditable so that inbound/outbound failure dan reconnect bisa ditelusuri. | 1. Given connect/disconnect/inbound/outbound/failure event terjadi, When event selesai diproses, Then audit trail tersimpan dengan actor, tenant, account channel, dan timestamp. 2. Given webhook ditolak karena invalid signature, When event ditolak, Then security/audit log mencatat penolakan tanpa menyimpan secret sensitif. |
| US-007 | P1 | As a Product and Engineering team, I want Shopee integration to reuse existing platform backbone so that future marketplace channels dapat mengikuti pola yang sama. | 1. Given platform Shopee ditambahkan, When system memproses add-on activation, Then flow tetap menggunakan model `Platform` → `Channel` → `AccountChannel` existing. 2. Given service Shopee membutuhkan komunikasi dengan service lain, When kontrak internal dibuat, Then komunikasi mengikuti gRPC/RabbitMQ pattern existing dan tidak bypass API architecture. |

---

## **6. Functional Requirements**

### **6.1 Platform Registration and Add-On Activation**

| Category | Requirements |
| ----- | ----- |
| Platform Backbone | FR-001 [P0]: System MUST register Shopee as a new platform with internal code `shopee`. FR-002 [P0]: Platform Shopee MUST be marked as `isAddOns = true`. FR-003 [P0]: System MUST create Shopee channel entities using the existing `Platform` → `Channel` → `AccountChannel` model. FR-004 [P0]: Activation of Shopee as add-on MUST reuse existing add-on commercial flow and quota validation where applicable. |

### **6.2 Account Onboarding and Credential Lifecycle**

| Category | Requirements |
| ----- | ----- |
| Connection Setup | FR-005 [P0]: System MUST provide one settings flow to connect a Shopee account/shop into tenant scope. FR-006 [P0]: System MUST store Shopee credentials or authorization artifacts securely in encrypted form. FR-007 [P0]: System MUST bind every Shopee account connection to exactly one `accountChannelId`. FR-008 [P0]: One tenant MAY connect multiple Shopee account channels if quota and permission allow. |
| Connection Status | FR-009 [P0]: System MUST expose connection health for each Shopee account channel. FR-010 [P0]: System MUST support explicit disconnect and reconnect actions for authorized users. FR-011 [P0]: If credential validity expires or provider revokes access, system MUST mark the account channel as disconnected or invalid and block outbound send until recovery. |

### **6.3 Inbound Webhook Intake**

| Category | Requirements |
| ----- | ----- |
| Webhook Validation | FR-012 [P0]: System MUST validate tenant-safe authenticity of every Shopee webhook before processing business data. FR-013 [P0]: Invalid or unverifiable webhook payload MUST be rejected and MUST NOT create or mutate conversation/message data. FR-014 [P0]: System MUST persist a safe processing trace for accepted and rejected webhook events. |
| Inbound Parsing | FR-015 [P0]: System MUST parse inbound Shopee text messages into normalized internal message payloads. FR-016 [P0]: System MUST extract and store provider identifiers at minimum for shop/account, buyer/contact, thread/session, event, and message. FR-017 [P0]: System MUST store provider raw payload only in a safe diagnostic shape when needed, without secrets or unnecessary sensitive fields. |

### **6.4 Contact and Conversation Resolution**

| Category | Requirements |
| ----- | ----- |
| Contact Identity | FR-018 [P0]: System MUST resolve Shopee customer identity using channel-scoped external identity, not by assuming phone number availability. FR-019 [P0]: System MUST use `channelId + referenceId` compatible identity behavior for client contact creation or reuse. FR-020 [P0]: `referenceId` for Shopee MUST be stable per buyer identity within the connected Shopee account/shop scope. FR-021 [P0]: If a safe stable buyer identifier is unavailable, system MUST NOT guess identity from display name alone. |
| Conversation Resolution | FR-022 [P0]: System MUST resolve inbound Shopee messages to one active conversation using tenant, account channel, contact identity, and provider thread identity. FR-023 [P0]: If no matching active conversation exists, system MUST create a new open conversation with platform `Shopee`. FR-024 [P0]: If a matching Shopee conversation exists for the same thread, system MUST append the message to that conversation. FR-025 [P0]: System MUST store provider identifiers required for deterministic thread resolution on subsequent inbound events. FR-026 [P0]: System MUST keep canonical conversation status model `open` / `closed` and MUST NOT introduce a Shopee-specific conversation status taxonomy. |

### **6.5 Message Persistence and Timeline**

| Category | Requirements |
| ----- | ----- |
| Message Model | FR-027 [P0]: Every inbound and outbound Shopee message MUST store `externalMessageId` when provided by provider. FR-028 [P0]: Every Shopee message MUST store provider metadata needed for troubleshooting and status reconciliation. FR-029 [P0]: Phase 1 MUST support text messages only. FR-030 [P0]: Unsupported Shopee message types in Phase 1 MUST NOT break webhook processing for supported text messages. FR-031 [P1]: Unsupported inbound message types SHOULD be represented as safe placeholder system entries or ignored with audit visibility according to final design decision. |

### **6.6 Outbound Reply**

| Category | Requirements |
| ----- | ----- |
| Send Flow | FR-032 [P0]: Authorized users MUST be able to send outbound text replies from Conversation Room to Shopee. FR-033 [P0]: Outbound reply MUST use the connected Shopee account channel associated with the conversation or a deterministic sender resolution rule. FR-034 [P0]: System MUST persist outbound message in the conversation timeline before or during send processing with a pending/send-in-progress state if such status exists in current architecture. FR-035 [P0]: Final outbound result MUST be reconciled to success or failed state. |
| Send Guard | FR-036 [P0]: System MUST block outbound Shopee reply when account channel is disconnected, invalid, or lacks required authorization. FR-037 [P0]: System MUST block unsupported outbound content types in Phase 1. FR-038 [P0]: System MUST NOT silently fallback to another platform/account when Shopee sender resolution fails. |

### **6.7 Status Synchronization**

| Category | Requirements |
| ----- | ----- |
| Status Events | FR-039 [P0]: If Shopee exposes message delivery lifecycle callbacks, system MUST map them to internal status updates for the matching message. FR-040 [P0]: If provider does not expose a given status level, system MUST NOT fabricate it. FR-041 [P0]: Status callbacks received out of order MUST be reconciled deterministically and MUST NOT regress a more terminal state to a weaker earlier state without explicit rule. |

### **6.8 Inbox, Filter, and UI Surface**

| Category | Requirements |
| ----- | ----- |
| Chat List | FR-042 [P0]: Shopee conversations MUST appear in Omnichannel Inbox with platform/channel label `Shopee`. FR-043 [P0]: Shopee conversations MUST respect existing visibility scope and inbox filter behavior. FR-044 [P0]: Channel filter and analytics grouping MUST include Shopee as a first-class platform. |
| Room Behavior | FR-045 [P0]: If Shopee does not require custom rendering in Phase 1, the default conversation bubble and default text input MAY be reused. FR-046 [P1]: If Shopee requires platform-specific visual treatment later, implementation MUST use existing FE platform registry extension points rather than hardcoding conditional logic in shared room components. |

### **6.9 Permissions and RBAC**

| Category | Requirements |
| ----- | ----- |
| Settings Access | FR-047 [P0]: Only authorized settings users may activate, connect, reconnect, or disconnect Shopee account channels. FR-048 [P0]: Phase 1 MUST reuse existing add-on management permission model unless a stronger Shopee-specific permission is later approved. |
| Inbox Access | FR-049 [P0]: Viewing Shopee conversations MUST follow existing inbox RBAC and tenant scope rules. FR-050 [P0]: Sending replies to Shopee MUST follow existing message-send permission rules. FR-051 [P0]: Server-side enforcement is mandatory; FE-only hiding is insufficient. |

### **6.10 Audit, Analytics, and Operational Safety**

| Category | Requirements |
| ----- | ----- |
| Audit | FR-052 [P0]: System MUST audit connect, reconnect, disconnect, credential/auth failure, inbound accepted, inbound rejected, outbound success, and outbound failure events. FR-053 [P0]: Audit entries MUST include actor when user-triggered and service source when system-triggered. |
| Analytics | FR-054 [P0]: Shopee conversations MUST be included in platform-level conversation analytics. FR-055 [P1]: Shopee account/channel health metrics SHOULD be observable for support and rollout monitoring. |
| Recovery | FR-056 [P0]: Webhook retry and outbound retry behavior MUST be idempotent. FR-057 [P0]: Transient downstream failure MUST NOT create duplicate conversation or duplicate message artifacts on retry. |

---

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Aktivasi add-on ditolak jika tenant tidak memiliki quota/add-on entitlement yang cukup. | Tampilkan pesan kegagalan aktivasi yang jelas. |
| EH-002 | Connection | Koneksi akun Shopee gagal karena otorisasi atau kredensial tidak valid. | Tampilkan `Gagal menghubungkan akun Shopee` tanpa membocorkan secret. |
| EH-003 | Security | Webhook Shopee gagal diverifikasi. | Jangan buat/mutasi conversation. Catat security log. |
| EH-004 | Duplicate | Webhook retry dengan event/message yang sama diterima ulang. | System mengabaikan duplikat secara idempotent. Tidak ada duplicate message. |
| EH-005 | Mapping | Buyer identity tidak dapat diresolusikan secara aman. | Event ditahan atau dicatat sebagai failed processing; jangan tebak contact dari display name. |
| EH-006 | Mapping | Thread identity tidak cukup untuk menentukan conversation target. | System membuat conversation baru hanya jika aturan minimum aman terpenuhi; jika tidak, event masuk exception handling internal. |
| EH-007 | Outbound | Account channel Shopee sedang disconnected atau invalid saat agent mengirim balasan. | Composer diblok atau send ditolak dengan `Akun Shopee tidak terhubung`. |
| EH-008 | Outbound | Provider menerima request tetapi status final tidak kembali tepat waktu. | Message masuk state pending/unknown sesuai implementasi status existing dan dipantau retry/reconcile. |
| EH-009 | Outbound | Provider mengembalikan kegagalan final saat kirim pesan. | Message ditandai gagal dan user melihat `Pesan gagal dikirim ke Shopee`. |
| EH-010 | Permission | User tanpa hak settings mencoba connect/disconnect/reconnect Shopee. | Tampilkan `Akses ditolak`. |
| EH-011 | Permission | User tanpa izin kirim pesan membuka conversation Shopee. | Composer disembunyikan atau dinonaktifkan sesuai pola existing. |
| EH-012 | Unsupported Capability | Webhook inbound membawa tipe pesan yang belum didukung di Phase 1. | Jangan merusak pipeline text. Catat unsupported event untuk observability. |
| EH-013 | Partial Failure | Contact berhasil direuse tetapi create message gagal di service downstream. | Retry aman secara idempotent tanpa membuat contact/conversation duplikat. |
| EH-014 | Status Sync | Status callback datang sebelum outbound message record lengkap tersedia. | Buffer/retry reconcile internal hingga record tersedia atau timeout observability tercapai. |

---

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Satu buyer mengirim ulang webhook yang sama karena retry provider. | Tidak ada duplicate conversation atau duplicate message. | Tidak ada perubahan visual ganda. |
| EC-002 | Satu tenant menghubungkan lebih dari satu shop Shopee. | Setiap shop menjadi account channel terpisah dalam tenant yang sama. | User dapat membedakan shop dari nama account channel. |
| EC-003 | Buyer yang sama menghubungi dua shop Shopee berbeda milik tenant yang sama. | Contact resolution tetap channel/account scoped sesuai aturan identity yang aman. | Tidak boleh salah menggabungkan conversation lintas shop bila tidak diizinkan. |
| EC-004 | Inbound text datang untuk conversation yang sebelumnya `closed`. | System mengikuti canonical reopen/create policy yang disetujui backend untuk thread Shopee tanpa membuat state non-canonical baru. | Status tetap `open`/`closed` saja. |
| EC-005 | Provider mengirim status callback lebih dulu daripada message payload utama. | Callback tidak boleh membuat artifact yatim permanen. | Tidak ada pesan bayangan di UI. |
| EC-006 | Outbound dikirim dua kali karena double-click atau retry client. | Idempotency guard mencegah double-send ke provider. | User tidak melihat dua pesan terkirim tanpa niat. |
| EC-007 | Credential/token kedaluwarsa di tengah proses outbound. | Message gagal final atau pending-recover sesuai contract retry; account ditandai butuh reconnect. | User melihat status gagal yang jelas. |
| EC-008 | Provider menolak pesan karena policy/limit yang tidak terpenuhi. | Message ditandai gagal dengan reason ter-normalisasi. | UI menampilkan error aman tanpa raw provider secret. |
| EC-009 | Unsupported non-text inbound masuk bersamaan dengan text inbound pada thread yang sama. | Text inbound tetap diproses normal; unsupported item dicatat sesuai policy. | Timeline tidak rusak. |
| EC-010 | User kehilangan permission saat halaman room masih terbuka. | Aksi kirim berikutnya wajib divalidasi server-side dan ditolak bila tidak lagi berhak. | Composer dinonaktifkan setelah refresh state. |

---

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Settings → Channels → Add-On → Shopee | Entry point untuk aktivasi dan pengelolaan account channel Shopee. | Admin membuka halaman add-on → aktifkan Shopee → connect akun/toko → lihat status koneksi. | US-001, US-005 |
| Shopee Account Card / Row | Menampilkan nama shop/account, status koneksi, action reconnect/disconnect, dan health hint. | User melihat daftar akun Shopee tenant dan memilih action operasional. | US-001, US-005 |
| Conversation Chat List | Menampilkan label/indikator Shopee pada conversation card. | Agent melihat dan memfilter traffic Shopee dari inbox. | US-002, US-004 |
| Conversation Room | Menggunakan bubble dan input default untuk text-only Phase 1 kecuali patch khusus diperlukan. | Agent membuka room Shopee → membaca message → membalas text. | US-002, US-003 |
| Status Badge / Toast | Menunjukkan connect success, disconnect state, outbound success/failure, dan reconnect requirement. | User menerima feedback jelas setelah action atau failure. | US-001, US-003, US-005 |
| Error / Empty State | Menjelaskan status disconnected, unsupported capability, atau tidak adanya akun Shopee. | User memahami kenapa action tidak tersedia atau data belum ada. | US-001, US-005 |

### **Required UI Copy**

| Context | UI Copy |
| ----- | ----- |
| Add-on card title | `Shopee` |
| Connect action | `Hubungkan akun Shopee` |
| Reconnect action | `Hubungkan ulang` |
| Disconnect action | `Putuskan koneksi` |
| Connect success | `Akun Shopee berhasil terhubung` |
| Connect failure | `Gagal menghubungkan akun Shopee` |
| Disconnected state | `Akun Shopee tidak terhubung` |
| Credential expired | `Sesi Shopee kedaluwarsa. Hubungkan ulang akun.` |
| Unsupported message type | `Tipe pesan Shopee ini belum didukung` |
| Outbound failure | `Pesan gagal dikirim ke Shopee` |
| Permission denied | `Akses ditolak` |
| No account state | `Belum ada akun Shopee yang terhubung` |

---

## **10. Field & Validation**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `platformCode` | String | `shopee` | Must equal internal platform code Shopee. | Yes | `shopee` |
| `accountChannelId` | String | `acc_123` | Must reference one tenant-scoped Shopee account channel. | Yes | — |
| `shopExternalId` | String | `shop_998877` | Must be unique within the relevant tenant/platform scope. | Yes | — |
| `shopDisplayName` | String | `Toko ABC Official` | Non-empty; max length per UI constraint. | Yes | — |
| `buyerReferenceId` | String | `buyer_112233` | Must be stable for contact resolution; must not be display name only. | Yes | — |
| `shopeeThreadId` | String | `thread_778899` | Must be stable enough for deterministic conversation resolution. | Yes | — |
| `externalEventId` | String | `evt_abc123` | Used for idempotent webhook processing when available. | Conditional | — |
| `externalMessageId` | String | `msg_xyz789` | Used for message deduplication and status sync. | Conditional | — |
| `messageContent` | Text | `Halo, saya ingin tanya stok.` | Required for text message type. | Yes | — |
| `messageType` | Enum | `text` | Phase 1 allowed values: `text` only. Unsupported values must be blocked or downgraded safely. | Yes | `text` |
| `connectionStatus` | Enum | `connected` | Must align with existing generic account-channel connection status model. | Yes | `inactive` |
| `authHealth` | Enum | `healthy` | UI/operational derived field for healthy / expiring / expired / revoked if implemented. | No | `healthy` |
| `lastWebhookReceivedAt` | Datetime | `2026-06-17T10:30:00+07:00` | Tenant timezone aware. | No | — |
| `lastOutboundAt` | Datetime | `2026-06-17T10:45:00+07:00` | Derived from last successful or attempted outbound per policy. | No | — |
| `failureReasonCode` | String | `provider_auth_expired` | Required when connection or send fails with normalized reason. | Conditional | — |

---

## **11. State Transition Model**

| Entity | Current State | Action / Trigger | Next State | Allowed Roles | Guard Conditions | Side Effects | Audit Event |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Shopee Account Channel | `inactive` | Admin activates and completes valid connect flow | `connected` | Admin / Supervisor with settings permission | Add-on entitlement valid, auth success, tenant valid | Create/update account channel, store encrypted auth artifact, enable webhook route binding | `shopee_account_connected` |
| Shopee Account Channel | `connected` | User-triggered disconnect | `disconnected` | Admin / Supervisor with settings permission | Account exists and belongs to tenant | Block outbound send, preserve historical data, revoke/unbind provider session if applicable | `shopee_account_disconnected` |
| Shopee Account Channel | `connected` | Provider revoke / auth expiry / health failure | `disconnected` | System | Failure validated by callback/health rule | Mark account unusable for outbound until reconnect | `shopee_account_invalidated` |
| Shopee Account Channel | `disconnected` | Authorized reconnect succeeds | `connected` | Admin / Supervisor with settings permission | Re-auth success | Refresh encrypted auth artifact, restore outbound ability | `shopee_account_reconnected` |
| Conversation | none | Valid inbound Shopee text for new thread | `open` | System | Webhook valid, identity resolvable, thread not mapped | Create contact if needed, create conversation, create message | `shopee_inbound_message_created` |
| Conversation | `open` | Valid inbound Shopee text for existing thread | `open` | System | Same tenant, same thread resolution match | Append message, update chat list latest activity | `shopee_inbound_message_appended` |
| Conversation | `open` | Agent sends outbound Shopee text successfully | `open` | Agent / Supervisor / Admin with send permission | Account channel connected, sender resolved, message type supported | Persist outbound message, sync status | `shopee_outbound_message_sent` |
| Conversation | `open` | Agent sends outbound Shopee text and final provider failure occurs | `open` | Agent / Supervisor / Admin with send permission | Same as above | Persist failed state, expose failure reason | `shopee_outbound_message_failed` |
| Conversation | `closed` | Valid inbound Shopee text hits mapped closed thread | `open` or new `open` conversation per backend-approved reopen policy | System | Must follow canonical conversation policy; no Shopee-specific status model | Reopen or create new conversation according to approved rule | `shopee_closed_thread_reengaged` |

**Note:** Phase 1 tidak menambah status conversation baru. Canonical status tetap `open` / `closed`.

---

## **12. Permission Matrix**

| Role | View Shopee Settings | Connect / Reconnect / Disconnect Shopee | View Shopee Conversation | Send Shopee Reply | View Audit / Operational Logs | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Agent | Denied | Denied | Allowed by inbox scope | Allowed by inbox send permission | Denied | Agent hanya menangani percakapan dalam scope. |
| Supervisor | Allowed if has settings/add-on permission | Allowed if has settings/add-on permission | Allowed by team / inbox scope | Allowed by send permission | Allowed if audit visibility policy permits | Supervisor operasional dapat bantu reconnect bila diizinkan tenant. |
| Admin | Allowed | Allowed | Allowed by tenant scope | Allowed | Allowed | Admin menjadi owner utama pengelolaan add-on. |
| Super Admin | Allowed | Allowed | Allowed | Allowed | Allowed | Bypass restrictions sesuai policy existing. |

**Server-side enforcement is mandatory.** Action yang disembunyikan di UI tetap harus divalidasi ulang di backend.

---

## **13. API / Event Contract**

| Contract | Method / Event | Producer | Consumer | Request / Payload | Response / Ack | Error Codes | Compatibility Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Shopee Connect Init | `POST /account-channel/shopee/connect` or equivalent connect-init endpoint | FE Settings | API Gateway → Shopee Service / Channel Service | Tenant context + connect request data sesuai auth model resmi | Connect session / success result | auth invalid, quota denied, permission denied | Final request shape depends on chosen official auth model but tenant scoping is mandatory. |
| Shopee Reconnect | `POST /account-channel/shopee/reconnect` | FE Settings | API Gateway → Shopee Service / Channel Service | `accountChannelId` + reconnect context | Success / failure | auth invalid, permission denied | Must reuse existing account channel identity. |
| Shopee Disconnect | `POST /account-channel/shopee/disconnect` | FE Settings | API Gateway → Shopee Service / Channel Service | `accountChannelId` | Success / failure | permission denied, account not found | Must not delete historical conversations. |
| Shopee Webhook | `POST /webhook/shopee` or equivalent secure ingress | Shopee | API Gateway / Shopee Service | Provider webhook payload with signature/auth proof | 2xx ack only after accepted processing contract | invalid signature, malformed payload | Must support idempotent retry from provider. |
| Shopee Inbound Internal Event | `shopee.message.inbound` | Shopee Service | Conversation Service / People Service / Notification / Analytics | Normalized inbound payload incl. tenant, account, contact, thread, message ids | Internal ack | processing failure | Prefer async event after validation. |
| Shopee Outbound Send | Internal gRPC / event for outbound message dispatch | Conversation / API Gateway | Shopee Service | Normalized outbound payload incl. `accountChannelId`, text, correlation ids | send accepted / failed | disconnected, unsupported type, provider reject | No silent fallback to other channels. |
| Shopee Status Update | `shopee.message.status` | Shopee Service | Conversation Service / Socket / Analytics | External message id + normalized status + timestamps | Internal ack | message not found, stale callback | Must be tolerant of out-of-order callbacks. |
| Shopee Account Health Update | `shopee.account.health` | Shopee Service | Channel Service / Settings UI / Audit | `accountChannelId`, health state, reason | Internal ack | account missing | Used for disconnected / expired auth indicators. |

---

## **14. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | P95 accepted inbound Shopee webhook processing to normalized internal event dispatch under 3 seconds excluding provider latency. |
| Performance | P95 conversation/message creation after valid inbound under 30 seconds end-to-end. |
| Reliability | Duplicate webhook retries must be idempotent and must not create duplicate conversation/message artifacts. |
| Reliability | Outbound send flow must support safe retry or reconciliation without double-send side effects. |
| Security | All Shopee credentials, tokens, or secret materials must be encrypted at rest. |
| Security | All webhook validation must be tenant-safe and must reject unverifiable payloads. |
| Privacy | Stored payloads and logs must avoid unnecessary PII duplication and must not store raw secrets. |
| Observability | System must emit logs/metrics for connect, disconnect, inbound accepted, inbound rejected, outbound success, outbound failure, duplicate webhook, and auth expiry. |
| Localization | User-facing UI copy must be Bahasa Indonesia. |
| Compatibility | Existing non-Shopee channels must continue working without requiring their payload contracts to change. |

---

## **15. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Official Shopee auth model and messaging contract | Product / Engineering | Build cannot finalize without official integration contract. | Lock during technical spike before implementation starts. |
| Stable buyer/thread identity from provider | Engineering | Wrong mapping creates duplicate or misrouted conversations. | Use channel-scoped external identity and deterministic thread keys only. |
| Existing add-on quota/billing flow | Product / Engineering | Activation may fail or behave inconsistently without quota policy. | Reuse current add-on commercial model and document quota clearly. |
| Existing inbox RBAC and filter behavior | Engineering / QA | Shopee results may leak or disappear incorrectly. | Regression test all visibility scopes. |
| Provider retry and ordering behavior | Engineering | Duplicate or out-of-order events may corrupt message state. | Enforce idempotency, ordering guards, and observability. |
| Unsupported message capabilities | Product / Engineering | User expectation mismatch if media appears partially supported. | Lock Phase 1 to text-only and expose unsupported capability clearly. |
| Analytics schema alignment | Engineering / Data | Platform reports may become inconsistent. | Add Shopee to platform enum and analytics grouping before pilot. |
| Support and operations readiness | Support / Ops | Reconnect or failure triage may be slow at launch. | Provide audit trail, health state, and rollout runbook. |

---

## **16. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
| ----- | ----- | ----- | ----- | ----- |
| Platform / Enum | Tambah platform code `shopee` di BE dan FE, plus seed platform/channel config. | Engineering | Smoke test settings, filters, analytics enum usage | Revert enum + seed behind feature flag before tenant rollout |
| New Service | Tambah service Shopee dengan contract internal gRPC/RabbitMQ mengikuti pola channel existing. | Engineering | Integration test connect, webhook, outbound, status | Disable routing/feature flag dan stop webhook consumer |
| Data | Tidak ada backfill histori conversation lama pada Phase 1. Hanya data baru setelah aktivasi yang diproses. | Product / Engineering | Pilot tenant menerima hanya new traffic sesuai aktivasi time | Nonaktifkan account channel dan block new inbound processing |
| Feature Flag | Gunakan feature flag per tenant / pilot list. | Product / Engineering | Pilot tenant only, monitored release | Disable flag tanpa menghapus data historis |
| Rollout | Internal test → sandbox/pilot tenant → limited production → broader rollout | Product / Engineering / QA | Smoke + regression gates per stage | Stop rollout, keep existing non-Shopee channels unaffected |

---

## **17. Data Lifecycle & Retention**

| Data | Owner | Created By | Retention | Archive/Delete Policy | Export Policy | Privacy Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Shopee account credential/auth artifact | Channel / Shopee service | Connect/reconnect flow | Selama account channel aktif atau sampai policy revoke berlaku | Hapus/rotasi saat disconnect permanent atau revoke sesuai security policy | Tidak diexport | Must be encrypted at rest |
| Shopee webhook processing trace | Shopee service | Webhook intake | Sesuai log retention operasional | TTL/log policy environment | Tidak diexport ke user | Sanitized, no raw secret |
| Shopee conversations | Conversation service | Valid inbound / outbound flow | Mengikuti retention conversation existing | Mengikuti policy conversation existing | Mengikuti export/transcript policy existing bila applicable | Tenant-scoped |
| Shopee messages | Conversation service | Valid inbound / outbound flow | Mengikuti retention message existing | Mengikuti policy existing | Mengikuti export/transcript policy existing | Text only in Phase 1 |
| Shopee audit events | Audit / operational logging | User/system actions | Sesuai audit retention policy | Archive/delete per compliance policy | Tidak otomatis diexport ke tenant kecuali fitur audit mendukung | No secret in audit payload |

---

## **18. Analytics & Observability Plan**

| Signal | Name | Trigger | Properties | Owner | Alert / Threshold |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Product Event | `shopee_account_connected` | Connect berhasil | tenant, accountChannelId, actor | Product / Engineering | Monitor pilot volume |
| Product Event | `shopee_account_disconnected` | Disconnect / auth revoke | tenant, accountChannelId, reason | Product / Engineering | Alert if spike abnormal |
| Product Event | `shopee_conversation_created` | Inbound new thread | tenant, accountChannelId, threadId | Product / Engineering | Baseline traffic only |
| Product Event | `shopee_outbound_message_sent` | Outbound success | tenant, accountChannelId, messageId | Product / Engineering | Track send success rate |
| Product Event | `shopee_outbound_message_failed` | Outbound fail | tenant, accountChannelId, normalized reason | Product / Engineering | Alert when fail rate > threshold |
| Log / Metric | `shopee_webhook_rejected_total` | Webhook signature/payload invalid | tenant if resolvable, reason class | Engineering | Alert on sustained spikes |
| Log / Metric | `shopee_webhook_duplicate_total` | Duplicate event detected | tenant, accountChannelId | Engineering | Trend only unless spike abnormal |
| Log / Metric | `shopee_inbound_processing_latency_ms` | Inbound accepted | p50/p95 latency | Engineering | Alert if P95 breaches target |
| Log / Metric | `shopee_auth_expiry_total` | Auth/session invalidated | accountChannelId | Engineering / Ops | Alert immediately for pilot tenants |
| Audit Event | `shopee_connect_action` | User-triggered connect/reconnect/disconnect | actor, tenant, accountChannelId, result | Engineering / Support | Reviewable in audit tooling |

---

## **19. Concurrency, Rate Limit & Idempotency**

| Scenario | Risk | Required Behavior | Validation |
| ----- | ----- | ----- | ----- |
| Provider retries webhook event | Duplicate conversation/message creation | System MUST deduplicate using provider event id, external message id, or deterministic idempotency key | QA replay same webhook payload multiple times |
| Double-click outbound send | Double-send to Shopee | System MUST enforce outbound idempotency/correlation guard for the same pending client action | QA rapid-click send button |
| Out-of-order status callbacks | Message state regression | System MUST reconcile status transitions deterministically and MUST NOT downgrade terminal state incorrectly | QA send callbacks in reverse order |
| Parallel token refresh / reconnect | Race condition on auth artifact | System MUST serialize or safely coordinate refresh/update for the same account channel | QA concurrent reconnect simulation |
| Inbound while account health toggles | Misroute or reject valid messages | Inbound processing MUST use deterministic account resolution and not corrupt conversation state | QA webhook during reconnect/disconnect |
| Downstream partial failure after contact reuse | Duplicate entity on retry | Retry MUST be safe and entity creation MUST be idempotent | QA forced failure after contact resolution |
| Provider rate limit | Burst outbound failure | System SHOULD normalize provider rate-limit failures and prevent uncontrolled retry storm | QA mocked rate-limit response |

---

## **20. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Shopee account connect success rate | ≥95% for valid pilot onboarding attempts | 30 days after pilot start | Connect logs |
| Valid inbound processing success rate | ≥95% | 30 days after pilot start | Webhook processing metrics |
| Outbound send success rate | ≥95% excluding provider-side hard reject categories | 30 days after pilot start | Outbound metrics |
| Duplicate message incident rate from webhook retry | 0 confirmed P0 duplicate incidents | Ongoing | QA + support tickets + logs |
| Regression incident count on existing channels | 0 P0 / P1 rollout-caused incidents | Pilot rollout window | QA and incident tracking |
| Time to identify disconnected Shopee account | ≤30 detik dari settings page | Pilot rollout window | UAT / ops validation |

---

## **21. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Attachment support | Marketplace users kemungkinan membutuhkan image/file handling setelah text-only stabil. |
| Order context sidebar | Buyer chat marketplace sering butuh konteks order, status pengiriman, dan issue type. |
| Auto ticket creation / tagging | Channel marketplace berpotensi lebih efektif bila terhubung dengan ticket workflows. |
| Marketplace-specific templates | Respons terstruktur mungkin dibutuhkan untuk operasional seller. |
| Multi-thread policy by order | Beberapa seller mungkin ingin memisahkan conversation by order/case, bukan hanya by buyer/thread. |
| Additional marketplace channels | Pola Shopee dapat menjadi template untuk Tokopedia, Lazada, atau marketplace lain. |

---

## **22. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Phase 1 hanya text-only | Attachment/rich message dari Shopee belum tersedia di release awal. |
| Tidak ada import histori lama | Tenant hanya melihat traffic baru setelah aktivasi. |
| Order/refund/shipping context tidak masuk Phase 1 | Agent masih perlu membuka sistem lain untuk detail operasional non-chat. |
| Health model bergantung contract resmi Shopee | Detail status lanjutan bisa berubah setelah spike teknis final. |

---

## **23. Appendix**

| Item | Notes |
| ----- | ----- |
| Assumptions | PRD ini mengasumsikan tersedia contract resmi Shopee untuk auth, inbound event, dan outbound reply yang legal dipakai tenant. |
| Open Questions | 1. Auth model final Shopee apa? 2. Thread identity paling stabil apa? 3. Apakah status `read`/`delivered` tersedia? 4. Apakah buyer identity selalu stabil lintas shop? 5. Apakah ada hard rate limit per shop/account? |
| References | `Assessments/cross-domain/shopee-channel-addon/shopee-channel-addon-qa-assessment.md`, `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md` |
| Release Note Guidance | Gunakan positioning `Shopee Channel Add-On (Phase 1: Core Inbox)` untuk menghindari asumsi order-management penuh. |
