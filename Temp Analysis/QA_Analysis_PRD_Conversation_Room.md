# QA Analysis — PRD Inbox Conversation Room

| Item | Detail |
|------|--------|
| **Dokumen Sumber** | PRD Inbox Conversation - room.md |
| **Versi PRD** | v1.1 |
| **Tanggal PRD** | 03 September 2025 |
| **Dibuat oleh** | Senior QA Lead |
| **Tanggal Analisa** | 18 Mei 2026 |

---

## Ringkasan Eksekutif

PRD ini mendefinisikan fitur **Conversation Room** pada platform SatuInbox — ruang percakapan omnichannel antara agent dan customer. PRD cukup solid di level requirement fungsional, namun terdapat beberapa ambiguitas dan inkonsistensi yang harus diselesaikan sebelum QA dapat memulai testing secara penuh.

| Kategori | Jumlah |
|----------|--------|
| P0 User Stories | 9 |
| P1 User Stories | 7 |
| P2 User Stories | 3 |
| Loophole Teridentifikasi | 12 |
| Impact Area | 8 |
| Jenis Test yang Diperlukan | 6 |

---

## 1. Impact Analysis

### 1.1 HIGH Impact

#### Real-time Socket & Message Delivery
- **Area terdampak:** Typing indicator, presence update, message status (sent/delivered/read)
- **Risiko:** Semua bergantung pada WebSocket. Jika socket lag atau putus, UX sangat terdampak.
- **Gap PRD:** Fallback ke polling disebutkan tapi tidak ada threshold kapan fallback aktif.
- **Tag:** `WebSocket` `Real-time` `Message Status` `Typing Indicator`

#### Multi-channel Identity Rules
- **Area terdampak:** Header conversation — nama/identitas customer
- **Risiko:** Aturan identitas berbeda tiap channel (WA 1:1, WA Group, Live Chat). Tidak ada definisi jika data null/empty — apakah fallback ke placeholder atau error?
- **Gap PRD:** Belum ada AC untuk kondisi data identitas tidak tersedia.
- **Tag:** `WhatsApp` `Live Chat` `WA Group` `Identity Display`

#### SLA Countdown & Hold/Resume
- **Area terdampak:** SLA timer, workflow manajemen chat
- **Risiko:** SLA pauses saat Hold, namun tidak ada spesifikasi behavior ketika:
  - Resume dilakukan setelah SLA sudah expired
  - Chat otomatis reopen karena pesan baru masuk saat status Hold
- **Gap PRD:** Potensi SLA miscalculation yang tidak terdeteksi.
- **Tag:** `SLA Timer` `Hold` `Resume` `Auto-reopen`

---

### 1.2 MEDIUM Impact

#### File Upload & Attachment Handling
- **Area terdampak:** Semua fitur upload (Ctrl+V, drag & drop, attachment button)
- **Risiko:** PRD menyebut max **100MB** di Section 5, tapi Section 12 (Limitations) menyebut max **15MB** — inkonsistensi ini harus dikonfirmasi ke PM sebelum testing dimulai.
- **Gap PRD:** Juga belum jelas apakah validasi format dilakukan hanya di client-side atau juga server-side.
- **Tag:** `Attachment` `Upload Limit` `Format Validation` `Ctrl+V` `Drag & Drop`

#### Auto-retry & Offline Scenario
- **Area terdampak:** Pengiriman pesan dalam kondisi koneksi tidak stabil
- **Risiko:** Auto-retry 3x dengan interval 5s terdefinisi, namun tidak ada spesifikasi:
  - Apakah pesan tetap tersimpan di queue jika semua retry gagal?
  - Apa yang terjadi dengan state pesan yang sudah di-send tapi koneksi putus sebelum response server diterima?
- **Tag:** `Retry Logic` `Offline Queue` `Error State`

#### RBAC & Permission Enforcement
- **Area terdampak:** Semua aksi agent, supervisor, admin
- **Risiko:** Disebutkan RBAC untuk restrict delete/resolve by role, tapi tidak ada tabel permission yang jelas. Tidak terdefinisi siapa yang bisa: Resolve, Hold, ubah alias, delete pesan, pin conversation.
- **Gap PRD:** Krusial untuk security testing — QA tidak bisa membuat test case tanpa matrix ini.
- **Tag:** `Agent` `Supervisor` `Admin` `Role-based Access`

---

### 1.3 LOW-MEDIUM Impact

#### Disappearing Messages & Channel-dependent Features
- **Area terdampak:** Presence indicator, disappearing messages, rich cards
- **Risiko:** Banyak fitur bersifat "channel-dependent" namun tidak ada matriks channel support yang eksplisit di PRD. QA harus membuat compatibility matrix sendiri berdasarkan asumsi.
- **Tag:** `Channel Compat` `Disappearing Msg` `Rich Cards`

#### Ticket Creation Flow
- **Area terdampak:** Integrasi Conversation Room → Ticket System
- **Risiko:** AC menyebut "Ticket auto-linked to chat; appears in Ticket System with reference ID" namun tidak ada detail alur error jika Ticket System tidak tersedia (dependency eksternal).
- **Tag:** `Ticket System` `Integration` `External Dependency`

---

## 2. Loophole & Ambiguitas PRD

### KRITIS

| # | Loophole | Detail |
|---|----------|--------|
| L-01 | **Inkonsistensi batas file size** | Section 5 menyebut max 100MB, Section 12 menyebut max 15MB. Harus dikonfirmasi sebelum testing. |
| L-02 | **Tidak ada definisi "Close" button logic** | AC menyebut "Close (ongoing assigned chats)" — tidak jelas apakah Close = Resolve atau hanya menutup UI. Juga tidak ada AC untuk Close pada chat Unassigned atau Resolved. |
| L-03 | **Reminder notification delivery tidak jelas** | AC menyebut "browser/push" — tidak jelas apakah hanya browser notification, push mobile, atau keduanya. Tidak ada AC untuk kondisi user offline saat reminder tiba, atau notifikasi diblock user. |

---

### PENTING

| # | Loophole | Detail |
|---|----------|--------|
| L-04 | **Typing indicator — scope agent vs customer** | AC hanya mendefinisikan typing indicator antar-agent. Tidak ada AC apakah customer juga terlihat sedang typing dari sisi agent (terutama Live Chat). Tidak ada AC untuk kondisi agent logout saat sedang typing. |
| L-05 | **Multi-select message — tidak ada limit** | Fitur multi-select untuk bulk copy atau create ticket tidak memiliki batas maksimum pesan. Potensi performance issue jika user memilih ribuan pesan sekaligus. |
| L-06 | **Quick Reply template — tidak ada max character** | Text area dibatasi 2000 karakter per pesan, tapi Quick Reply template tidak memiliki batas karakter yang didefinisikan. Tidak jelas apa yang terjadi jika template >2000 karakter. |
| L-07 | **Inline reply-to — behavior pada deleted/hidden message** | Tidak ada AC untuk kondisi ketika pesan yang di-reply sudah dihapus, expired (disappearing message), atau tidak dapat dimuat. |
| L-08 | **Search ≤2s — client-side atau server-side tidak terdefinisi** | NFR menyebut search ≤2s dengan support 10K+ messages. Tidak ada spesifikasi apakah search dilakukan di client (in-memory) atau server-side — kritis untuk strategi performance testing. |

---

### MINOR

| # | Loophole | Detail |
|---|----------|--------|
| L-09 | **Screenshot add-on — kondisi tidak aktif** | AC menyebut Screenshot muncul "if add-on active". Tidak ada AC untuk tampilan UI ketika add-on tidak aktif — apakah button hidden, disabled, atau tidak muncul. |
| L-10 | **Timestamp — timezone handling** | Tidak ada AC untuk timezone pada tampilan relative/full timestamp. Potensi confusion untuk agent lintas zona waktu. |
| L-11 | **Pin Conversation — tidak ada batas maksimum** | Tidak ada AC berapa maksimum conversation yang bisa di-pin per agent/workspace, dan bagaimana sort order pin di chat list. |
| L-12 | **WCAG 2.1 AA — daftar keyboard shortcut tidak final** | NFR menyebut "≥5 keyboard shortcuts (e.g., send, search)" dengan kata "e.g." yang bersifat tidak definitif. QA tidak bisa membuat test case accessibility tanpa daftar shortcut yang lengkap dan final. |

---

## 3. Yang Diperlukan QA untuk Testing

### 3.1 Klarifikasi yang Harus Diminta ke PM/Dev (Sebelum Sprint)

- [ ] Konfirmasi batas file upload: **15MB atau 100MB?**
- [ ] Tabel RBAC lengkap: role → aksi apa saja yang diizinkan
- [ ] Channel feature matrix: fitur mana aktif di channel mana
- [ ] Daftar keyboard shortcut final (untuk WCAG testing)
- [ ] Behavior "Close" vs "Resolve" — apakah sama?
- [ ] API schema untuk Rich Card payload (untuk negative testing)
- [ ] Definisi SLA behavior saat resume setelah expired
- [ ] TRD (masih kosong di PRD) — diperlukan untuk API dan backend testing

---

### 3.2 Environment & Data Setup yang Diperlukan

- [ ] Akun multi-role: Agent, Supervisor, Admin, Developer
- [ ] Koneksi ke semua channel: WhatsApp 1:1, WA Group, Live Chat
- [ ] Mekanisme simulasi WA session expired (untuk relogin flow)
- [ ] Tool untuk simulasi socket disconnect/lag (network throttling — Charles Proxy / Proxyman)
- [ ] Seed data: conversation dengan 10K+ messages (scalability test)
- [ ] Setup browser notification environment (untuk reminder test)
- [ ] File test set: berbagai format dan ukuran untuk edge case upload
- [ ] Akses ke staging environment dengan ELK Stack & Prometheus (untuk verify log dan metric)

---

### 3.3 Jenis Testing yang Harus Dilakukan

#### Functional Testing
- Happy path seluruh P0 user stories
- Negative testing: semua error state yang terdefinisi di Section 8
- Boundary testing: file size limit, character limit (2000 chars), typing indicator limit (5 agents)
- Cross-channel testing: semua channel type (WA 1:1, WA Group, Live Chat)

#### Real-time / Socket Testing
- Multi-agent typing indicator (1, 5, dan >5 agent bersamaan)
- Message status transitions: Pending → Sent → Delivered → Read → Error → Retry
- Socket disconnect dan reconnect behavior
- Presence update accuracy (online/offline)
- Fallback ke polling saat socket gagal

#### Performance Testing
- Conversation room load time ≤1s (KPI target PRD)
- Search response ≤2s pada thread dengan 10K+ messages
- Socket update latency ≤2s
- Attachment upload time untuk berbagai ukuran file
- Load test dengan banyak agent aktif secara bersamaan

#### Security / RBAC Testing
- Akses endpoint tanpa autentikasi
- Cross-role action: Agent mencoba aksi yang hanya diizinkan Supervisor/Admin
- Verifikasi enkripsi attachment (AES-256)
- Privilege escalation attempt via API manipulation
- Input sanitization pada semua text field (XSS, injection)

#### Compatibility Testing
- Browser: Chrome, Firefox, Safari, Edge (versi terbaru)
- OS: Windows, macOS
- Channel feature matrix testing (fitur channel-dependent)
- Mobile browser jika dalam scope

#### Accessibility Testing
- WCAG 2.1 AA compliance audit
- Keyboard shortcut coverage (semua shortcut yang terdefinisi final)
- ARIA label verification pada chat bubbles dan controls
- Screen reader test (NVDA / VoiceOver)

---

### 3.4 Test Case Priority Matrix

#### P0 — Harus Lulus Sebelum Release

| # | Test Scenario | AC Referensi |
|---|---------------|-------------|
| TC-01 | Tampilan identitas customer per channel (WA 1:1, WA Group, Live Chat) — termasuk edge case data null | US-1 |
| TC-02 | Message status transitions lengkap: Pending → Sent → Delivered → Read → Error → Retry | US-6 |
| TC-03 | Auto-retry 3x interval 5s — verifikasi via log dan tampilan status | US-6 |
| TC-04 | Typing indicator: 1 agent, 5 agent, dan >5 agent bersamaan | US-4 |
| TC-05 | Presence indicator muncul hanya pada channel yang support | US-3 |
| TC-06 | Chat bubble: visual distinction agent vs client vs private note, timestamp relative/full | US-5 |
| TC-07 | Reminder: buat one-time, buat recurring, notifikasi terpicu di waktu yang tepat | US-7, US-8 |
| TC-08 | Action menu: Copy, Pin Conversation — aksi berhasil dan tercatat di log | US-9 |
| TC-09 | Header controls: Screenshot (add-on aktif/tidak), Close, More menu | US-2 |
| TC-10 | Inactive channel → relogin popup muncul dan flow dapat diselesaikan | US-6 |

#### P1 — Harus Lulus Sebelum GA

| # | Test Scenario | AC Referensi |
|---|---------------|-------------|
| TC-11 | Hold → SLA timer pause, Resume → SLA timer lanjut | US-P1-1 |
| TC-12 | Ticket creation dari single message dan multi-select message | US-P1-2 |
| TC-13 | Thread search: keyword highlight, next/prev navigation, date filter, ≤2s | US-P1-3 |
| TC-14 | Upload attachment: valid format, invalid format (toast error), size limit | US-P1-4 |
| TC-15 | Ctrl+V paste text, Ctrl+V paste image, drag & drop file ke text area | US-P1-5 |
| TC-16 | WA Session expired → relogin popup → resume conversation | Error Handling |
| TC-17 | Bot auto-reply di luar jam kerja, welcome message di jam kerja | US-P1-6 |
| TC-18 | Quick Reply template: pilih, insert ke text area, send | US-P1-6 |

#### P2 — Bisa Dilakukan Iterasi Berikutnya

| # | Test Scenario | AC Referensi |
|---|---------------|-------------|
| TC-19 | Tagging pada bubble dan searchability tag | US-P2-1 |
| TC-20 | Audit log: handover, open/close, tagging — akses Supervisor | US-P2-2 |
| TC-21 | Rich card via API: image, title, desc, 3 buttons, carousel | US-P2-3 |
| TC-22 | WCAG 2.1 AA: ARIA label, keyboard shortcuts, screen reader | NFR |

---

### 3.5 Risiko yang Perlu Diantisipasi Tim QA

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| **TRD masih kosong** | Tidak bisa lakukan API/backend testing | Request TRD ke Engineering sebelum sprint mulai |
| **Figma belum final di beberapa story** | Interpretasi berbeda antara QA dan Dev | Lakukan design review session bersama sebelum testing |
| **WhatsApp library dependency** (Baileys/Cloud API) | Behavior bisa berbeda antar versi library | Konfirmasi versi library yang digunakan ke Engineering |
| **Feature flag tidak disebutkan** | Tidak bisa test kondisi add-on aktif/tidak aktif | Request mekanisme toggle add-on di staging environment |
| **Scalability test data** | Butuh 10K+ messages per thread | Buat automation script/data seeder lebih awal sebelum sprint testing |
| **Socket testing complexity** | Sulit simulasi kondisi jaringan tidak stabil | Siapkan tool network throttling (Charles Proxy/Proxyman) sejak awal |

---

## 4. Rekomendasi QA

### Sebelum Sprint Dimulai
1. Adakan **PRD Clarification Meeting** dengan PM untuk menyelesaikan semua loophole KRITIS (L-01 s/d L-03)
2. Request **TRD** dari Engineering Lead untuk referensi API contract
3. Susun **Channel Feature Matrix** bersama Engineering untuk menentukan scope compatibility testing
4. Finalisasi **RBAC Permission Table** bersama PM dan Engineering

### Selama Sprint
5. Prioritaskan test execution sesuai urutan: P0 → P1 → P2
6. Lakukan **exploratory testing** khusus pada area socket/real-time karena AC-nya paling tipis
7. Catat semua temuan terkait loophole yang belum terklarifikasi sebagai **defect tipe "Clarification Needed"** — bukan Bug, bukan N/A

### Setelah Sprint
8. Dokumentasikan **compatibility matrix aktual** hasil testing untuk referensi sprint berikutnya
9. Buat **regression test suite** dari semua TC P0 untuk dijalankan di setiap release
10. Review ulang loophole MINOR (L-09 s/d L-12) untuk dimasukkan ke backlog PRD v1.2

---

*Dokumen ini dibuat berdasarkan PRD Inbox Conversation - room.md v1.1 (03 Sep 2025)*
*QA Analysis oleh: Senior QA Lead | 18 Mei 2026*
