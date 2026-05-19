# QA Analysis — PRD Inbox Conversation Detail

| Item | Detail |
|------|--------|
| **Dokumen Sumber** | PRD Inbox Conversation - detail.md |
| **Versi PRD** | v2.1 |
| **Tanggal PRD** | 09 September 2025 |
| **Dibuat oleh** | Senior QA Lead |
| **Tanggal Analisa** | 18 Mei 2026 |

---

## Ringkasan Eksekutif

PRD ini mendefinisikan **Conversation Detail Panel** — panel kontekstual di sisi kanan conversation room yang menampilkan metadata percakapan, assignee, SLA, atribut, tag, notes, media, file, dan history. PRD versi v2.1 sudah lebih matang dibanding PRD Room, namun terdapat sejumlah ambiguitas kritis terutama seputar behavior state, permission model, dan batas-batas teknis yang tidak konsisten antar section.

| Kategori | Jumlah |
|----------|--------|
| User Stories | 13 |
| Acceptance Criteria | 15 |
| Functional Requirements | 20 |
| Loophole Teridentifikasi | 14 |
| Impact Area | 7 |
| Error Handling Scenarios | 12 |
| Jenis Test yang Diperlukan | 6 |

---

## 1. Impact Analysis

### 1.1 HIGH Impact

#### SLA Countdown — State Dependency & Desync Risk
- **Area terdampak:** AC-02, FR-03, semua alur assignee
- **Risiko:** SLA *First Response Due* hanya muncul saat **Unassigned** — artinya begitu chat di-assign, timer menghilang. Tidak ada AC yang menjelaskan:
  - Apakah timer *First Response Due* berhenti atau hilang dari tampilan setelah pertama kali direspons?
  - Jika agent di-unassign kembali setelah memberikan respons, apakah timer muncul lagi?
  - Behavior SLA saat conversation di-reassign ke agent/team lain
- **Risk dari PRD sendiri:** Tercatat sebagai risiko "SLA countdown desync (client vs server time)" dengan probabilitas Medium/High, tapi tidak ada spesifikasi bagaimana desync terdeteksi di sisi UI.
- **Tag:** `SLA` `Assignee` `State Machine` `Timer`

#### Assignee State Machine — Unassigned vs Assigned
- **Area terdampak:** AC-01, FR-01, FR-02, seluruh workflow assignment
- **Risiko:** PRD mendefinisikan dua state (Unassigned & Assigned) namun tidak ada state diagram atau transition table. Tidak terdefinisi:
  - Apakah ada state ketiga, misalnya "Assigned tapi semua assignee offline"?
  - Apa yang terjadi jika satu-satunya assignee dihapus dari sistem (user dinonaktifkan)?
  - Siapa yang bisa unassign — hanya Supervisor/Admin atau Agent sendiri juga bisa?
- **Tag:** `State Machine` `Assignment` `Role` `Edge Case`

#### Custom Attributes dari External API — Reliability
- **Area terdampak:** AC-15, FR-20, AC-04 (Dynamic Attributes)
- **Risiko:** Custom attributes bergantung pada external API (CRM, dll). Tidak ada spesifikasi:
  - Timeout berapa lama sebelum attribute dianggap gagal dimuat?
  - Apakah attribute ditampilkan dengan nilai terakhir yang di-cache jika API gagal?
  - Bagaimana jika schema dari external API berubah (field baru / field dihapus)?
  - Disebutkan "update dynamically when the source data changes" — tidak ada spesifikasi interval polling atau mekanisme webhook.
- **Tag:** `External API` `Custom Attributes` `Cache` `Reliability`

#### Tag Sync dengan WhatsApp — Latency & Failure
- **Area terdampak:** AC-06, FR-11, Success Metrics (Tag Sync ≤5s)
- **Risiko:** Tag harus sync dengan WhatsApp Web/Business ≤5s. Error handling menyebut "Queue retry, log internally" jika sync gagal, namun tidak ada AC untuk:
  - Tampilan tag saat sedang dalam status pending sync (apakah ada visual indicator?)
  - Apa yang terjadi jika retry queue penuh atau habis?
  - Apakah tag yang gagal sync bisa ditandai secara visual agar agent tahu?
- **Tag:** `Tag Sync` `WhatsApp` `Async` `Error State`

---

### 1.2 MEDIUM Impact

#### Phone Number Masking — Scope & Bypass Risk
- **Area terdampak:** AC-05, FR-08, field Client Phone Number
- **Risiko:** Field validasi menyebut "default Masked for Agent" — namun tidak terdefinisi:
  - Siapa yang bisa melihat nomor tanpa masking? Apakah Supervisor/Admin bisa unmask?
  - Apakah masking dilakukan di client-side atau server-side? Jika client-side, rentan di-bypass via DevTools.
  - Format masking `+62812••••7890` — berapa digit yang disembunyikan? Apakah konsisten untuk semua format nomor internasional?
- **Tag:** `PII` `Masking` `Security` `Privacy`

#### Conversation History — Scope & Performance
- **Area terdampak:** AC-08, FR-13, Limitations (group chat)
- **Risiko:** "All past conversations" tanpa batas waktu atau jumlah bisa menjadi masalah performa. Limitations menyebut "Room history not available for group chats" tapi tidak ada AC untuk tampilan placeholder ketika history tidak tersedia untuk group chat.
- Juga tidak ada definisi apakah "past conversations" termasuk conversation yang sudah diarchive atau dihapus.
- **Tag:** `Performance` `History` `Group Chat` `Pagination`

#### Conflict (Edit Lock) — Multi-user Editing
- **Area terdampak:** Error Handling "Conflict (Edit Lock)"
- **Risiko:** Skenario edit bersamaan (dua agent mengedit field yang sama) ditangani dengan "Prompt refresh" — namun tidak ada AC untuk:
  - Field mana saja yang bisa mengalami edit conflict (tags, notes, assignee, atribut)?
  - Apakah ada optimistic locking atau last-write-wins?
  - Bagaimana data yang sudah diinput agent pertama — hilang, tersimpan, atau ada merge dialog?
- **Tag:** `Concurrency` `Edit Lock` `Multi-agent` `Data Integrity`

---

### 1.3 LOW-MEDIUM Impact

#### Reminder — Scope Terbatas pada User yang Mengaktifkan
- **Area terdampak:** AC-03, FR-04
- **Risiko:** AC-03 menyebut reminder hanya muncul "for the user who activated it" — ini berbeda dengan PRD Room yang menyebut reminder bisa dilihat di Conversation Details. Perlu konfirmasi apakah reminder bersifat personal (per-agent) atau bisa dilihat oleh seluruh assignee.
- **Tag:** `Reminder` `Personal vs Team` `Cross-PRD Inconsistency`

#### Pinned Messages — Batas & Navigasi
- **Area terdampak:** AC-10, FR-15, Error Handling (Exceed Limit)
- **Risiko:** Error handling menyebut batas pinned messages = 10, namun tidak ada AC yang mendefinisikan batas ini secara eksplisit di User Story. Juga tidak ada AC untuk behavior "click to jump" ketika pesan yang di-pin sudah sangat lama dan membutuhkan lazy load untuk ditampilkan di room.
- **Tag:** `Pinned Messages` `Navigation` `Limit`

---

## 2. Loophole & Ambiguitas PRD

### KRITIS

| # | Loophole | Detail |
|---|----------|--------|
| L-01 | **Inkonsistensi batas file upload** | Error handling menyebut batas file **25MB**, sementara PRD Room menyebut **100MB**, dan Limitations PRD Room menyebut **15MB**. Tiga angka berbeda untuk satu batasan yang sama. Harus dikonfirmasi ke PM dan Engineering sebelum testing. |
| L-02 | **AC-02 SLA: "First Response Due hanya muncul saat Unassigned"** | Tidak ada definisi apa yang terjadi dengan timer ini setelah chat di-assign. Apakah hilang, berhenti, atau berubah menjadi indikator "sudah direspons"? Kritis karena berdampak langsung pada compliance SLA. |
| L-03 | **Tidak ada state diagram Unassigned → Assigned → Resolved** | PRD mendefinisikan dua state tapi tidak ada transition table. QA tidak bisa membuat test case untuk edge case transisi state tanpa ini. |
| L-04 | **Custom Attributes "update dynamically" — mekanisme tidak terdefinisi** | Apakah update via polling (interval berapa?), webhook, atau socket? Tanpa spesifikasi ini QA tidak bisa menguji akurasi dan latency dynamic attribute update. |
| L-05 | **US-07 tidak memiliki ID** | Satu user story ("To view all past conversations") tidak memiliki ID (baris kosong di tabel). Ini bisa menyebabkan test case tidak bisa di-trace ke requirement yang benar. |

---

### PENTING

| # | Loophole | Detail |
|---|----------|--------|
| L-06 | **Masking nomor telepon: client-side atau server-side?** | Jika masking dilakukan di client-side, sangat rentan di-bypass. PRD tidak mendefinisikan implementasi masking, padahal ini menyangkut perlindungan data PII pelanggan. |
| L-07 | **Siapa yang bisa unassign agent?** | AC-01 hanya menyebut "allow add/remove" tanpa mendefinisikan role yang diizinkan. Apakah Agent bisa unassign dirinya sendiri? Apakah Agent bisa remove assignee lain? |
| L-08 | **Conversation Notes — siapa yang bisa edit/hapus?** | FR-14 menyebut "Admin able to mention other Agents from notes" tapi tidak jelas apakah Agent bisa mengedit/menghapus notes milik agent lain. AC-09 hanya menyebut "users with proper permission" tanpa detail. |
| L-09 | **Sticky Note limit = 1, tapi Notes tidak ada limit?** | Error handling menyebut "Sticky Note Limit: hanya 1 sticky note diizinkan" — tapi tidak ada penjelasan apa perbedaan antara "Sticky Note" dan "Conversation Notes" yang ada di AC-09 dan FR-14. Apakah ini dua fitur berbeda? |
| L-10 | **Related Conversations — siapa yang bisa link?** | AC-13 menyebut "must be linked and navigable" namun tidak ada AC untuk siapa yang bisa membuat link (hanya Supervisor/Admin atau Agent juga?), dan apakah ada maksimum jumlah related conversation yang bisa dilink. |
| L-11 | **Broadcast History — relasi ke conversation tidak jelas** | AC-14 menyebut "semua broadcasts must be logged" tapi tidak jelas apakah broadcast history yang ditampilkan adalah yang dikirim ke contact ini saja, atau semua broadcast yang pernah dikirim oleh team. |
| L-12 | **Tags — 2-way sync hanya WhatsApp, bagaimana channel lain?** | PRD menyebut "2-way sync (WhatsApp)" tapi tidak ada spesifikasi behavior tag sync untuk Live Chat atau channel lain. Apakah tag di channel non-WA hanya lokal di SatuInbox? |

---

### MINOR

| # | Loophole | Detail |
|---|----------|--------|
| L-13 | **Client Location "if allowed" — tidak ada mekanisme consent** | FR-09 menyebut "must comply with user consent and privacy policies" tapi tidak ada AC tentang bagaimana consent diperoleh, disimpan, dan dicabut. |
| L-14 | **Reminder AC-03 vs PRD Room — inkonsistensi scope** | AC-03 menyebut reminder hanya untuk "user who activated it" (personal). PRD Room (US-7, US-8) menyebut reminder terlihat di Conversation Details (implisit bisa dilihat semua assignee). Perlu alignment antar PRD. |

---

## 3. Yang Diperlukan QA untuk Testing

### 3.1 Klarifikasi yang Harus Diminta ke PM/Dev (Sebelum Sprint)

- [ ] **Batas file upload: 25MB (PRD Detail), 100MB (PRD Room), atau 15MB (Limitations)?** — harus satu angka final
- [ ] State diagram lengkap: Unassigned → Assigned → Resolved (termasuk semua edge case transisi)
- [ ] Mekanisme update Custom Attributes: polling interval, webhook, atau socket?
- [ ] Implementasi phone masking: client-side atau server-side? Siapa yang bisa unmask?
- [ ] Perbedaan "Sticky Note" vs "Conversation Notes" — apakah dua fitur terpisah?
- [ ] Role matrix lengkap untuk: unassign agent, edit/hapus notes orang lain, link related conversation
- [ ] Scope reminder: personal (per-user) atau visible ke semua assignee?
- [ ] US-07 tanpa ID — minta PM assign ID resmi agar test case bisa di-trace
- [ ] TRD masih kosong — diperlukan API contract untuk semua endpoint (assignee, attributes, tags, notes)
- [ ] Behavior tag di channel non-WhatsApp (apakah sync atau hanya lokal?)

---

### 3.2 Environment & Data Setup yang Diperlukan

- [ ] Akun multi-role lengkap: Agent, Supervisor, Admin, Developer (minimal 2 akun per role untuk uji concurrency)
- [ ] Koneksi ke semua channel: WhatsApp Web, WhatsApp Business API, Live Chat
- [ ] External API mock/stub untuk Custom Attributes (untuk simulasi success, timeout, schema change, API error)
- [ ] Conversation dengan volume data tinggi: 200+ attributes, 20+ tags, 10+ pinned messages (untuk performa dan limit testing)
- [ ] Conversation history yang panjang (multi-sesi) untuk test pagination dan load performance
- [ ] Simulasi WA tag sync latency >5s (untuk test warning badge dan retry queue)
- [ ] Data PII test: nomor telepon berbagai format internasional (untuk test masking consistency)
- [ ] Setup dua session browser bersamaan untuk test Edit Lock / conflict scenario
- [ ] Staging environment dengan Prometheus (untuk verifikasi tag sync latency metric)
- [ ] Conversation dari group chat (untuk verifikasi limitation history tidak tersedia)

---

### 3.3 Jenis Testing yang Harus Dilakukan

#### Functional Testing
- Happy path seluruh 15 AC
- State transition: Unassigned → Assigned → Resolved (dan semua edge case)
- SLA countdown behavior per state
- Semua error handling scenarios (12 skenario dari Section 8)
- Boundary testing: tags max 20, pinned max 10, notes max 1000 chars, file batas yang sudah dikonfirmasi
- Cross-channel testing: WA Web vs WA Business vs Live Chat (terutama untuk attributes dan tag behavior)

#### Real-time & Sync Testing
- Tag sync latency: harus ≤5s (success metric)
- Tag sync failure: retry queue, tampilan warning badge
- Custom attributes dynamic update (sesuai mekanisme yang dikonfirmasi)
- SLA countdown accuracy vs server time (no desync)
- Edit Lock / conflict resolution saat dua agent edit field bersamaan

#### Permission / RBAC Testing
- Agent: aksi yang diizinkan vs yang tidak (edit custom field harus blocked — hanya P2)
- Supervisor: semua aksi termasuk akses Audit Log
- Admin: semua aksi termasuk mention di notes
- Akses phone number unmasked (siapa yang bisa)
- Akses Broadcast History (terbatas Supervisor+ sesuai Limitations)

#### Security & Privacy Testing
- Phone number masking tidak bisa di-bypass via DevTools / API response inspection
- PII data (name, email, location) tidak bocor ke role yang tidak seharusnya
- Client Location: verifikasi consent mechanism sebelum data ditampilkan
- Attachment download: verifikasi tidak bisa diakses tanpa autentikasi via direct URL

#### Performance Testing
- Panel load ≤1s dengan 200 attributes (KPI target PRD)
- Lazy loading saat attributes >200
- Conversation history load dengan banyak sesi historis
- Tag sync latency monitoring via Prometheus

#### Accessibility & UI Testing
- Field masking tampil konsisten di semua browser
- Placeholder tampil dengan benar saat data tidak tersedia (missing optional data)
- Error state untuk setiap field (format tidak valid, exceed limit)
- Figma design vs implementasi: semua section (Assignee, SLA, Attributes, Client Data, Tags, Notes, Media, Files, History)

---

### 3.4 Test Case Priority Matrix

#### P0 — Harus Lulus Sebelum Release

| # | Test Scenario | AC Referensi |
|---|---------------|-------------|
| TC-01 | Tampilan panel saat Unassigned: label "Unassigned", button "Assign Now", SLA First Response Due countdown | AC-01, AC-02 |
| TC-02 | Tampilan panel saat Assigned: chip avatar+nama assignee, SLA Time to Close Due | AC-01, AC-02 |
| TC-03 | SLA badge merah "SLA terlewati" saat SLA expired | AC-02 |
| TC-04 | Assign Team Inbox (required, single) dan Assignee (multi-select) — update immediate | AC-01, FR-01, FR-02 |
| TC-05 | Conversation Attributes: ID, Channel, Started At tampil akurat | AC-04, FR-05, FR-06 |
| TC-06 | Channel Name & Number tampil hanya untuk WhatsApp Web, tidak tampil untuk Live Chat | AC-04 |
| TC-07 | Client Data: Name, Phone (masked), Email — tampil benar, phone masking konsisten | AC-05, FR-08 |
| TC-08 | Client Data optional (Location, OS, Browser) — tidak break UI jika data tidak tersedia | AC-05 |
| TC-09 | Add, edit, remove tag — perubahan persist immediately | AC-06, FR-11 |
| TC-10 | Tag sync ke WhatsApp ≤5s — verifikasi latency | AC-06, Success Metrics |
| TC-11 | Conversation Events tampil kronologis: assignment, SLA change, status update | AC-07, FR-12 |
| TC-12 | Add/edit Conversation Notes, notes visible ke user dengan permission | AC-09, FR-14 |
| TC-13 | Upload media (image, video, audio) — inline view dan download | AC-11, FR-16 |
| TC-14 | Upload file (pdf, docx, xlsx) — download berhasil, validasi format/size | AC-12, FR-17 |

#### P1 — Harus Lulus Sebelum GA

| # | Test Scenario | AC Referensi |
|---|---------------|-------------|
| TC-15 | Reminder: hanya tampil jika fitur aktif, hanya untuk user yang mengaktifkan | AC-03 |
| TC-16 | Conversation History: semua sesi past tampil kronologis | AC-08, FR-13 |
| TC-17 | Pin message: tampil di section pinned, klik jump ke pesan asli di room | AC-10, FR-15 |
| TC-18 | Custom Attributes dari external API: tampil akurat, update dynamically | AC-15, FR-20 |
| TC-19 | Related Conversations: link dan navigate ke conversation terkait | AC-13, FR-18 |
| TC-20 | Broadcast History: tampil dengan timestamp dan recipient info akurat | AC-14, FR-19 |
| TC-21 | Error: Tag sync gagal — queue retry, tampil pesan error yang sesuai | Error Handling |
| TC-22 | Error: Edit Lock — dua agent edit field bersamaan, prompt refresh | Error Handling |
| TC-23 | Error: Exceed Limit — tags >20, pinned >10, file >batas yang dikonfirmasi | Error Handling |
| TC-24 | Permission Denied: Agent mencoba akses/edit custom fields — blocked | AC-04, FR-20 |
| TC-25 | Group chat conversation: verifikasi placeholder "Tidak ada riwayat" untuk history | Limitations |

#### P2 — Iterasi Berikutnya

| # | Test Scenario | AC Referensi |
|---|---------------|-------------|
| TC-26 | Custom Fields editable (roadmap P2) — jika sudah diimplementasi | FR-20 |
| TC-27 | Audit Log: hanya Supervisor+ yang bisa akses | Limitations |
| TC-28 | Performance: panel load ≤1s dengan 200 attributes | NFR, OKR |
| TC-29 | Lazy loading saat attributes >200 | Risks |
| TC-30 | WCAG accessibility panel detail | — |

---

### 3.5 Skenario Edge Case Kritis yang Wajib Diuji

Skenario-skenario berikut tidak eksplisit di AC/FR namun berpotensi tinggi ditemukan sebagai bug di production:

| # | Skenario | Mengapa Kritis |
|---|----------|---------------|
| EC-01 | Agent di-deactivate saat masih menjadi assignee aktif | Chip assignee akan broken, SLA mungkin tidak tertangani |
| EC-02 | External API Custom Attributes timeout saat panel dibuka | Panel harus tetap load tanpa error fatal, attribute section fallback |
| EC-03 | Schema external API berubah (field hilang atau tipe berubah) | Potensi UI crash atau data tampil salah |
| EC-04 | Tag dihapus dari master list sementara sudah dipakai di conversation | Tag di conversation masih tampil atau ikut hilang? |
| EC-05 | Conversation di-reassign ke Team Inbox lain — SLA config berbeda | SLA timer reset atau lanjut? |
| EC-06 | Pinned message dihapus dari room — apakah masih tampil di pinned section? | Navigasi "jump to message" akan broken |
| EC-07 | Conversation history sangat panjang (1000+ sesi) — scroll & load performance | Potensi browser crash atau infinite loading |
| EC-08 | Dua assignee menambahkan tag yang sama bersamaan | Duplicate tag atau deduplicated? |
| EC-09 | File dengan nama yang sama diupload dua kali | Replace, rename dengan suffix, atau block? |
| EC-10 | SLA "Time to Close Due" expired saat conversation masih di-Hold | Badge merah muncul saat Hold, atau hanya setelah Resume? |

---

### 3.6 Risiko yang Perlu Diantisipasi Tim QA

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| **TRD masih kosong** | Seluruh API testing tidak bisa dilakukan | Request TRD ke Engineering Lead sebelum sprint dimulai |
| **Tiga angka batas file size yang berbeda** | Test case akan salah jika menggunakan nilai yang keliru | Mandatory klarifikasi ke PM sebelum sprint, blokir test execution jika belum dikonfirmasi |
| **External API untuk Custom Attributes** | Jika API tidak tersedia di staging, test tidak bisa dilakukan | Request mock/stub API dari Engineering; jika tidak ada, flagging sebagai blocked |
| **US-07 tanpa ID** | Traceability test case ke requirement akan putus | Minta PM assign ID sebelum sprint; sementara pakai ID sementara "US-07b" |
| **Figma sebagai satu-satunya referensi UI** | Jika Figma berubah tanpa notifikasi, test bisa salah | Freeze Figma di awal sprint atau screenshot design sebagai baseline |
| **Dua PRD (Room & Detail) yang saling bergantung** | Bug bisa muncul di boundary antara dua PRD | Pastikan ada sesi joint review antara QA yang menangani kedua PRD |
| **WhatsApp tag sync** | Sulit di-test di staging jika WA API tidak terhubung | Koordinasi dengan Engineering untuk koneksi WA API di staging, atau gunakan mock |

---

## 4. Cross-PRD Inconsistency dengan PRD Room

Analisa lintas PRD antara PRD Conversation Detail (v2.1) dan PRD Conversation Room (v1.1):

| # | Topik | PRD Room (v1.1) | PRD Detail (v2.1) | Status |
|---|-------|-----------------|-------------------|--------|
| C-01 | Batas file upload | 100MB (Section 5), 15MB (Limitations) | 25MB (Error Handling) | ❌ Inkonsisten — perlu konfirmasi |
| C-02 | Scope Reminder | Terlihat di Conversation Details (implisit semua assignee) | Hanya untuk "user yang mengaktifkan" (personal) | ❌ Inkonsisten — perlu alignment |
| C-03 | Pin Conversation | "Pin Conversation" sebagai action di room | "Pinned Messages" di detail section | ⚠️ Perlu konfirmasi apakah sama fitur |
| C-04 | Auto-retry message | 3x, interval 5s | Tidak disebutkan | ⚠️ Perlu konfirmasi apakah berlaku di detail juga |
| C-05 | RBAC | Disebutkan ada tapi tidak ada tabel | Disebutkan ada tapi tidak ada tabel | ❌ Keduanya tidak punya matrix permission |

---

## 5. Rekomendasi QA

### Sebelum Sprint Dimulai
1. Wajib lakukan **Joint PRD Review** antara QA, PM, dan Engineering untuk menyelesaikan semua loophole KRITIS (L-01 s/d L-05) dan inkonsistensi lintas PRD (C-01 s/d C-05)
2. Request **State Diagram** Unassigned → Assigned → Resolved dari PM/Engineering
3. Request **TRD** (masih kosong) — tanpa TRD, API testing dan backend verification tidak bisa dilakukan
4. Minta PM assign ID resmi untuk US-07 yang hilang agar test case dapat di-trace
5. Konfirmasi **satu angka final** untuk batas file upload lintas seluruh PRD

### Selama Sprint
6. Gunakan **2 browser session bersamaan** untuk test Edit Lock dan concurrency scenario
7. Buat **channel-feature compatibility matrix** eksplisit sebagai artefak QA (tidak ada di PRD) sebelum melakukan cross-channel testing
8. Test Custom Attributes dengan **3 kondisi**: API sukses, API timeout, API schema berubah
9. Lakukan **exploratory testing** khusus pada 10 edge case kritis (EC-01 s/d EC-10) yang tidak ada di AC/FR

### Setelah Sprint
10. Dokumentasikan hasil test sebagai referensi **regression suite** untuk semua TC P0
11. Buat laporan **cross-PRD consistency check** jika ada PRD lain yang berinteraksi dengan Detail Panel
12. Escalate temuan terkait **PII masking implementation** ke Security team jika masking terbukti dilakukan di client-side

---

*Dokumen ini dibuat berdasarkan PRD Inbox Conversation - detail.md v2.1 (09 Sep 2025)*
*QA Analysis oleh: Senior QA Lead | 18 Mei 2026*
