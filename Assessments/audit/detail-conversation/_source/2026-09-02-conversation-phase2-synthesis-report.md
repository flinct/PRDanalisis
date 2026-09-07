# Laporan Sintesis Audit Phase 2 — Modul Conversation

| Field | Value |
|---|---|
| Tipe | Synthesis Report — Audit Phase 2 (Modul Conversation) |
| Owner | Dany Christian (Analyst) |
| Sumber Temuan | 3 laporan audit: first-time user flow, returning/power user flow, interconnection (Conversation ↔ Setting ↔ Ticket) |
| Artifact Path | `Assessments/audit/2026-09-02-conversation-phase2-synthesis-report.md` |
| Tanggal Analisa | 2026-09-02 |
| Status | Selesai (sintesis prioritas) |
| Decision Posture | `REVISE_PRD` (blok struktural) + `PROCEED_WITH_CAUTION` (quick-win FE) |

---

## Ringkasan Eksekutif

Tiga audit Phase 2 (user baru, user lama, interconnection) menghasilkan **44 temuan mentah**; setelah deduplikasi tumpang tindih menjadi **41 temuan unik** (3 merger) yang dikelompokkan ke **5 tema**.

Distribusi severity: **2 CRITICAL, 11 HIGH, 20 MEDIUM, 8 LOW**.

Dua temuan CRITICAL sama-sama berada di klaster SLA, dan keduanya bukan bug kode melainkan **ketiadaan keputusan struktural di level requirement**:
1. **Tiga lapis konfigurasi SLA tanpa precedence** (per-channel vs per-ticket-type vs per-team-inbox Custom SLA) — bisa memilih konfigurasi yang salah saat implementasi.
2. **Dual-SLA**: satu reply agent berpotensi menyelesaikan dua FRT berbeda (conversation FRT + ticket FRT) sekaligus tanpa aturan atribusi.

Pola besar yang muncul lintas audit:
- **Requirement gap, bukan bug** mendominasi sisi interconnection — 5 blocker struktural (SLA precedence, canonical AUX state, dual-SLA attribution, reopen handoff, create-ticket model) wajib di-lock sebelum fitur turunan (Snooze, Hold/Resume, Related Conversations, Auto-Reply) dibangun.
- **FE/UX gap yang konkret dan murah** mendominasi sisi user baru & user lama — dead-end (reminder = `console.log`), empty state tanpa CTA, ownership/assignee tak terlihat, unread undercount, state pencarian/filter yang hilang.

Rekomendasi dua-jalur: (1) lock requirement struktural lewat satu dokumen governance (jalur REVISE_PRD), (2) eksekusi quick-win FE paralel yang tidak diblokir keputusan struktural (jalur PROCEED_WITH_CAUTION). Detail di §4 dan §5.

---

## 1. Sumber Temuan & Deduplikasi

| # | Laporan Sumber | Lokasi | Temuan Mentah |
|---|---|---|---|
| 1 | Flow user baru (first-time) | `Assessments/audit/2026-09-02-conversation-first-time-user-flow-audit.md` | 12 |
| 2 | Flow user lama (returning/power user) | `Assessments/audit/2026-09-02-satuinbox-audit-2-conversation-returning-user-flow.md` | 12 |
| 3 | Interconnection (Conversation ↔ Setting ↔ Ticket) | `Assessments/cross-domain/conversation-setting-ticket-interconnection/conversation-setting-ticket-interconnection-qa-assessment.md` | 20 |
| | **Total mentah** | | **44** |

**Deduplikasi (3 merger, −3):**

| Merger | Sumber | Alasan |
|---|---|---|
| B1 | FT#2 (participants=[] ownership tak terlihat, HIGH) + IC#4 (assignee tidak divalidasi vs Team Inbox, MED) | Root cause sama: model assignment/ownership under-specified. FE menampilkan `participants=[]`; PRD tidak mendefinisikan validasi assignee terhadap membership team inbox. |
| B2 | FT#3 (Pull button disembunyikan utk AGENT round-robin) + FT#6 (tab Unassigned/All disembunyikan utk AGENT) | Satu dead-end yang sama: role AGENT tidak punya jalur terlihat mengambil percakapan pertama di org round-robin. |
| D5 | FT#8 (gate onboarding hanya KYC) + FT#9 (default setting kosong tanpa nudge) | Satu gap yang sama: setup pasca-approve (channel/team/SLA/shift) tidak dipandu dan default-nya senyap kosong. |

**Total unik: 41.**

---

## 2. Distribusi Severity & Tema

| Tema | CRITICAL | HIGH | MED | LOW | Total |
|---|---|---|---|---|---|
| A. SLA & Metrik (config, precedence, atribusi) | 2 | 3 | 4 | 0 | 9 |
| B. Assignment, Ownership & RBAC | 0 | 3 | 2 | 0 | 5 |
| C. Conversation↔Ticket Handoff & Data Sync | 0 | 2 | 4 | 1 | 7 |
| D. Onboarding & Empty States (user baru) | 0 | 1 | 4 | 3 | 8 |
| E. Efisiensi Daily-Use & Performa (user lama) | 0 | 2 | 6 | 4 | 12 |
| **Total** | **2** | **11** | **20** | **8** | **41** |

Severity dinormalisasi: `high`/`med`/`low` (laporan user baru/lama) dipetakan ke `HIGH`/`MEDIUM`/`LOW`; FT#3 `high (med-high)` dinormalisasi ke HIGH.

---

## 3. Tabel Temuan per Tema (urut severity + dampak)

Kolom: **ID · Kategori · Severity · Dampak · Lokasi · Rekomendasi**.

### Tema A — SLA & Metrik (config, precedence, atribusi)

| ID | Severity | Dampak | Lokasi | Rekomendasi |
|---|---|---|---|---|
| **A1** | **CRITICAL** | Satu conversation bisa punya 3 kandidat SLA sekaligus (channel, ticket-type, team-inbox) tanpa aturan pemenang → fairness SLA & angka reporting salah. | `PRD Conversation SLA.md` (per-channel), `PRD Ticket - SLA ticket.md` (per-ticket-type), `PRD Setting - team inbox.md` §SLA ("SLA Carry Over", "Apply to Ongoing") | Lock precedence dalam satu dokumen governance: channel → ticket-type → team-inbox Custom SLA, plus definisi interaksi "Carry Over"/"Apply to Ongoing" terhadap snapshot rule. |
| **A2** | **CRITICAL** | Satu reply agent bisa menyelesaikan conversation FRT (T1→T3) DAN ticket FRT (creation→reply) sekaligus dengan start-point beda → double-count / salah atribusi di reporting. | `PRD Ticket - Ticketing V2.md` AC-05, `PRD Ticket - SLA ticket.md` FR-020, Response Metrics FR-086 | Definisikan dual-SLA attribution: apakah satu event reply menyelesaikan keduanya atau butuh reply terpisah. |
| **A3** | HIGH | 3 sumber status waktu (presence Away, AUX, shift, office hour) tanpa satu canonical state → agent tampak available di HUD tapi dianggap unavailable oleh auto-reply/SLA. | `PRD Setting - presence management.md`, `PRD Conversation SLA.md` FR-013..015, Auto-Reply FR-021, shift & office hour PRD | Lock canonical AUX/presence state sebelum Snooze/Hold/Auto-Reply dibangun — satu enum untuk SLA pause, auto-reply eligibility, dan assignment. |
| **A4** | HIGH | Conversation yang di-link ke ticket, saat sama-sama "waiting on customer", conversation FRT tetap jalan (hanya TTC pause) tapi ticket FRT ikut pause — metric tidak konsisten. | `PRD Conversation SLA.md` FR-011..012 (WoC pause TTC only) vs `PRD Ticket - SLA ticket.md` FR-008..010 (WoC pause FRT+TTC+stage) | Selaraskan definisi WoC pause antar modul untuk linked conversation-ticket. |
| **A5** | HIGH | Reopen conversation vs reopen ticket tidak punya handoff → status tidak sinkron (conversation reopen tapi ticket tetap closed, atau sebaliknya). | `PRD Ticket - SLA ticket.md` FR-019 (reopen=cycle baru), SLA Engine Contract §5.4 (draft), global-memory "conversation SLA reopen undefined" | Definisikan handoff reopen: apakah reopen conversation men-trigger reopen linked ticket, atau independen. |
| **A6** | MEDIUM | 3 sumber waktu (office hour, shift, timezone) tanpa sinkronisasi; office hour punya auto-merge + snapshot yang tidak ada di shift → eligibility vs deadline bisa beda. | `PRD Setting - general.md`, `PRD Setting - office hour.md`, `PRD Setting - shift.md` | Unifikasi model waktu: satu sumber waktu kanonik untuk RLT/TTC/eligibility/deadline. |
| **A7** | MEDIUM | Auto-reply (undeveloped) belum punya kontrak eksplisit ke SLA engine → risiko bot message menyelesaikan FRT/T3 tanpa flag bot. | Auto-Reply FR-048, `PRD Conversation SLA.md` FR-036, Response Metrics FR-011 | Tambahkan kontrak: SatuInbox Bot TIDAK menyelesaikan FRT/ART/ticket SLA; flag bot message. |
| **A8** | MEDIUM | Ticket manual tanpa customer message yang di-resolve tanpa reply → ticket FRT running/breach selamanya (zombie). | `PRD Ticket - SLA ticket.md` FR-022, `sla-system-full-analysis.md` G-01 | Fix `not_applicable` untuk ticket manual tanpa reply; satukan dengan konsep "internal-only = Not Applicable" di Response Metrics. |
| **A9** | MEDIUM | Ticket manual tidak punya RLT sama sekali (blind spot); ticket detail UI hanya tampil FRT+Resolve chips, tidak ada slot RLT. | `sla-system-full-analysis.md` G-02, Response Metrics FR-084..085, `PRD Ticket - Ticket Detail.md` | Lock "Ticket Handling Time" dan tambahkan slot RLT di ticket detail. |

### Tema B — Assignment, Ownership & RBAC

| ID | Severity | Dampak | Lokasi | Rekomendasi |
|---|---|---|---|---|
| **B1** | HIGH | Percakapan yang di-assign tidak menampilkan agen sebagai assignee (`participants=[]`) → agen ragu kepemilikan, dobel-pull/dobel-reply; plus tidak ada validasi assignee vs Team Inbox. | FE `chat-detail/` (assignee section) + BE field `participants`; `Memory/global-memory.md`; `PRD Setting - team inbox.md` vs Create Ticket Consistency FR-031..035 | Implementasi `participants` agar ownership terlihat + definisikan validasi assignee terhadap membership Team Inbox (seperti ticket). |
| **B2** | HIGH | Role AGENT di org round-robin tidak punya jalur terlihat mengambil percakapan pertama (Pull button + tab Unassigned/All disembunyikan tanpa penjelasan) → "tidak ada kerjaan / produk rusak". | `ConversationChatLists.tsx` (useShowPullButton), `PullButton.tsx`, `ConversationNavItemDefault.tsx` (useInboxItems, `show: !isAgent`) | Pastikan jalur akses percakapan pertama untuk AGENT selalu ada & dijelaskan (pull vs round-robin vs unassigned), bukan disembunyikan diam-diam. |
| **B3** | HIGH | Delete member = side effect lintas modul (unassign conversation+ticket → round robin reassign) yang bisa mengubah `firstAssigneeId` historis → metric korup. | `PRD Setting - member.md` FR-027..029; SLA metrics `firstAgentAssignmentAt`/`firstAssigneeId` | Pertahankan `firstAssigneeId` historis saat unassign paksa; definisikan interaksi member-delete dengan `conversation_sla_metrics`. |
| **B4** | MEDIUM | Conversation & Ticket pakai dua istilah paralel untuk konsep sama (pull/claim) dengan permission key beda (`conversation:pull` vs `ticket:claim`) → perilaku tidak konsisten antar modul. | `PRD Setting - Role management.md` FR-019 (conversation_access_mode) & FR-020 (ticket_access_mode) | Satukan terminologi & mapping permission pull/claim lintas modul. |
| **B5** | MEDIUM | Masking phone/email per-role tidak punya satu spec yang menjamin konsistensi di conversation detail vs ticket detail. | `PRD Setting - Role management.md` FR-035..038; conversation detail `read_client_data` vs ticket client data | Satu spec masking konsisten di kedua permukaan untuk role yang sama. |

### Tema C — Conversation↔Ticket Handoff & Data Sync

| ID | Severity | Dampak | Lokasi | Rekomendasi |
|---|---|---|---|---|
| **C1** | HIGH | 3 PRD pembuatan ticket dari bubble saling kontradiktif (1 bubble→1 ticket vs 1 bubble→N draft vs multi bubble→1 ticket); FE sudah ship "multiple tickets" tapi Consistency Patch mengunci "one bubble = one ticket". | `Create Ticket Consistency Patch.md`, `Multi-Ticket Drafts from Single Chat Bubble.md`, `Ticketing V2.md` AC-01 | Resolusi konflik jadi satu model seleksi bubble kanonik sebelum menulis test suite. |
| **C2** | HIGH | Interaksi Related Conversations grouping (Primary+Child) dengan flag `is_ticket_message` tidak didefinisikan → blocking saat fitur undeveloped dibangun. | `Related Conversations Grouping.md` §Limitations, `Ticketing V2.md` AC-03 | Definisikan apakah `is_ticket_message` berlaku ke semua child saat grup di-ticket-kan. |
| **C3** | MEDIUM | Ticket >1 linked conversation; "primary link" didefinisikan beda di 3 tempat → metric inherit salah conversation. | `Ticket Detail.md` FR-075..077, Response Metrics FR-090/EC-029, Related Conversations Primary+Child | Satu definisi "primary linked conversation" konsisten di ketiga tempat. |
| **C4** | MEDIUM | Custom attributes conversation vs custom fields ticket vs ticket-type tidak disinkronkan → data sama bisa beda di dua permukaan. | `Conversation Custom Attributes.md`, `Ticket Detail.md` FR-063..068, `Create Ticket Consistency Patch.md` | Definisikan sinkronisasi conversation custom attributes ↔ linked ticket fields. |
| **C5** | MEDIUM | Dua composer (Conversation Room & Ticket Room) untuk satu thread → dua write-path, draft preservation & tempMessageId reconciliation beda. | `PRD Ticket - Ticket Room.md` vs Conversation Room PRD | Unifikasi delivery state & draft preservation antar dua composer. |
| **C6** | MEDIUM | Conversation snooze undeveloped vs ticket snooze developed (state) → asimetri perilaku; interaksi snooze conversation ↔ linked ticket tidak didefinisikan. | `Conversation Snooze (Conversation List).md` (undeveloped), `Memory/CLAUDE-be.md` §11/§7.4, Engine Contract §5.3 | Definisikan snooze conversation & interaksinya dengan linked ticket sebelum membangun. |
| **C7** | LOW | Auto-tag scope "Tiket"/"Percakapan dan Tiket" tidak diterapkan kalau ticket dibuat belakangan dari bubble yang sama (no auto-create) → tag tidak sinkron. | `PRD Setting - auto tag.md` FR-028..031, EC-008; `PRD Setting - tag management.md` | Definisikan backfill auto-tag saat ticket dibuat setelah message masuk. |

### Tema D — Onboarding & Empty States (user baru)

| ID | Severity | Dampak | Lokasi | Rekomendasi |
|---|---|---|---|---|
| **D1** | HIGH | User baru mendarat di layar buntu: empty state chat list tanpa CTA (tidak ada "hubungkan kanal"/"tarik percakapan"/"ajak tim"). | `EmptyChat.tsx` (EmptyConversation) + `packages/i18n/.../emptyState.chatList` | Tambahkan CTA kontekstual di empty state chat list. |
| **D2** | MEDIUM | Chat room empty state = gambar ilustrasi saja (`alt="No conversation selected."`) tanpa judul/instruksi → area terasa hilang, tidak mengajarkan cara memilih percakapan. | `ConversationChatRoomEmpty.tsx` + `chat-room-content/EmptyState.tsx` | Tambahkan teks/label instruktif & konsisten dengan empty state list. |
| **D3** | MEDIUM | Tidak ada in-product onboarding (tour/coachmark/petunjuk langkah pertama) — satu-satunya onboarding = verifikasi KYC, tidak menyentuh cara pakai inbox. | (absence) grep `tour/coachmark/firstTime/guide/hasSeen` di `components/molecules/conversations/` = kosong | Tambahkan guided onboarding fitur inti (filter, assign, bulk, SLA). |
| **D4** | MEDIUM | Banner "channel terputus / no-session" hanya dirender di dalam chat room; di level list tidak ada indikasi kanal belum terhubung → harus buka chat dulu untuk tahu tidak bisa kirim. | `ConversationChatRoomNoSession.tsx`, `DisconnectedAccountBanner.tsx`, `Input.tsx` (isAllChannelsInactive) | Prompt setup kanal proaktif di titik masuk (list level). |
| **D5** | MEDIUM | Setup pasca-approve (channel, team inbox, shift hours, SLA) tidak dipandu & default-nya senyap kosong → metrik & banner jam kerja tidak berfungsi sejak hari pertama. | `proxy.ts` (handleOnboardingRedirect), `ManageOnboardingPage.tsx`, `ManageOfficeHourPage.tsx`, `ManageGeneralSLAPage.tsx` | Nudge terstruktur pasca-approve + inisialisasi default aman. |
| **D6** | LOW | String error "Conversation not found." hardcoded (non-i18n, tampil Inggris di locale `id`) tanpa tombol retry/back. | `chat-room-content/InvalidState.tsx` | Lewatkan via next-intl + tambah aksi pemulihan (retry/back). |
| **D7** | LOW | Account channel selector fallback ke kanal pertama walau inactive → tombol kirim nonaktif padahal ada nomor lain aktif. | `AccountChannelSelector.tsx` (selectedId fallback `accountChannels[0].id`) | Fallback ke kanal `active` pertama, bukan index 0. |
| **D8** | LOW | Halaman onboarding render kosong untuk status tak dikenal → layar putih tanpa feedback. | `ManageOnboardingPage.tsx` (return `undefined` selain ONBOARDING/WAITING_APPROVAL) | Render fallback state untuk status tak dikenal. |

### Tema E — Efisiensi Daily-Use & Performa (user lama)

| ID | Severity | Dampak | Lokasi | Rekomendasi |
|---|---|---|---|---|
| **E1** | HIGH | Quick-action "Set Reminder" = stub `console.log` mati → user mengandalkan aksi yang tidak berfungsi, tanpa feedback/hint. | `QuickAction.tsx:155-160` (createReminderAction → `onClick: () => console.log('reminder')`) | Sembunyikan item "Set Reminder" sampai fitur ada (hapus dead-end). |
| **E2** | HIGH | Unread count "Your Inbox" undercount saat >20 conversation (doc bilang 100, kode pakai `DEFAULTS.LIMIT=20`) + fetch list penuh redundan. | `conversation.service.ts:321-343`, `useManageConversationAPIRequest.ts:157-170` (limit=20, baris 114-116) | Samakan limit ke 100 ATAU pakai count endpoint khusus; jangan fetch list untuk hitung badge. |
| **E3** | MEDIUM | Pencarian hilang diam-diam setiap ganti view (Inbox/Channel/Team). | `ConversationNavItemDefault.tsx:224-283` (semua handler panggil `resetSearch()`) | Jangan reset search saat ganti view; preserve query lintas-view. |
| **E4** | MEDIUM | Filter (status/read/search/advanced) tidak persist — hanya `sort` yang diingat; reset tiap reload/re-login. | `conversationFilter.store.ts:44-49` (partialize simpan `sort` saja), `conversationAdvancedFilter.store.ts:91` | Persist search & filter seperti `sort`. |
| **E5** | MEDIUM | Load histori pesan hanya infinite-scroll 25/page tanpa lompat/search → scroll repetitif untuk conversation lama/panjang. | `use-message.service.ts:69-83` (limit=25), `info.ts:2`, `ConversationChatRoomMessage.tsx:57-84` | Tambah jump-to-date + search dalam conversation. |
| **E6** | MEDIUM | List stale setelah socket reconnect (refetchOnReconnect tidak aktif) → user harus klik banner refresh manual; berdampak ke prioritas SLA/unread. | `makeQueryClientHelper.ts:11`, `use-conversation-refresh-notification.ts:35-41` | Aktifkan `refetchOnReconnect` (1 baris konfigurasi). |
| **E7** | MEDIUM | Keyboard nav parsial (tabIndex ada, handler stub) → power user dipaksa full-mouse untuk triage. | `ConversationCard.tsx` + `useChatHandlers.ts` | Lengkapi handler keyboard (next/prev conversation, buka room, quick-action). |
| **E8** | MEDIUM | Histori conversation sama-kontak butuh 3 level navigasi (list→messages→detail) + collapsed hanya 5 item / fetch max 100. | `ConversationHistoryContent.tsx:181-221`, `ConversationHistoryMessages.tsx:112-121` (MAX_COLLAPSED_ITEMS=5, FETCH_LIMIT=100) | Flatten navigasi histori + naikkan limit penjelajahan. |
| **E9** | LOW | Pesan sama di-fetch dua jalur berbeda (live vs history) tanpa cache bersama → redundansi saat bolak-balik room↔history. | `use-messages-api.ts:63-75` vs `use-conversation-history-messages-api.ts:54-74` | Unifikasi endpoint live/history + shared cache. |
| **E10** | LOW | Satu interval global mentrigger re-render semua card SLA tiap detik. | `useGlobalTicker.tsx:3` (TICK_INTERVAL_MS=1000), `ConversationCard.tsx:197-226` (DurationBadge) | Ganti ticker per-detik dengan deadline-based render. |
| **E11** | LOW | System event (mis. "nomor tidak terdaftar") hanya muncul dalam jendela 1 hari dari pesan tertua ter-load → timeline tidak stabil. | `use-combined-items.ts:56-64` (filter `>= oldestTimestamp - ONE_DAY_MS`) | Basiskan window utility event pada rentang load penuh. |
| **E12** | LOW | Minimum karakter pencarian inkonsisten (kode 2 vs komentar 3). | `ConversationChatListHeader.tsx:24` (MIN_SEARCH_LENGTH=2) vs komentar baris 158-159 | Selaraskan nilai dengan hint text yang ditampilkan. |

---

## 4. Top Prioritas: Quick-Win vs Big-Fix

### Quick-Win (fix kecil, dampak cepat, tidak diblokir keputusan struktural)

| Prioritas | ID | Temuan | Effort |
|---|---|---|---|
| Q1 | **E1** | Sembunyikan "Set Reminder" (dead-end `console.log`) | 1 baris |
| Q2 | **E2** | Unread undercount: limit 20→100 atau count endpoint | kecil |
| Q3 | **D1** | Empty state chat list + CTA kontekstual | kecil |
| Q4 | **E6** | Aktifkan `refetchOnReconnect` | 1 baris |
| Q5 | **E3 + E4** | Preserve search & persist filter (seperti `sort`) | kecil |
| Q6 | **D6** | "Conversation not found." → next-intl + retry/back | kecil |
| Q7 | **D7** | Channel selector fallback ke kanal `active` | kecil |
| Q8 | **E12** | Selaraskan min-search-char 2 vs 3 | trivial |

### Big-Fix (perlu effort / keputusan struktural)

| Prioritas | ID | Temuan | Sifat |
|---|---|---|---|
| B1 | **A1** | Lock precedence 3 lapis SLA | REVISE_PRD (governance doc) |
| B2 | **A2** | Dual-SLA attribution rule | REVISE_PRD |
| B3 | **A3** | Canonical AUX/presence state | REVISE_PRD (blocker Snooze/Hold/Auto-Reply) |
| B4 | **C1** | Resolusi konflik 3 PRD create-ticket | REVISE_PRD |
| B5 | **A5** | Reopen handoff conversation ↔ ticket | REVISE_PRD |
| B6 | **B1** | Assignment/ownership model (`participants`) | FE+BE develop |
| B7 | **B2** | Jalur akses AGENT round-robin (pull/unassigned) | FE develop |
| B8 | **E5 + E8 + E9** | Search dalam conversation + unifikasi endpoint live/history + cache | FE refactor |
| B9 | **E7** | Keyboard navigation penuh | FE develop |
| B10 | **C6** | Snooze conversation state machine | develop (blokir Engine Contract §5.3) |

---

## 5. Rekomendasi Strategis & Urutan Eksekusi

**Jalur 1 — Lock requirement struktural (REVISE_PRD), satu dokumen governance:**
1. Satu dokumen precedence SLA (A1): channel → ticket-type → team-inbox Custom SLA + interaksi "Carry Over"/"Apply to Ongoing" terhadap snapshot.
2. Lock canonical AUX/presence state (A3) sebelum Snooze/Hold/Auto-Reply dibangun.
3. Definisikan dual-SLA attribution (A2) untuk event reply pertama pada conversation dengan ticket aktif.
4. Resolusi konflik create-ticket (C1) jadi satu model seleksi bubble.
5. Definisikan reopen handoff (A5) conversation ↔ linked ticket.

**Jalur 2 — Quick-win FE paralel (PROCEED_WITH_CAUTION), tidak menunggu Jalur 1:**
- Eksekusi Q1–Q8 (§4) — semuanya FE, tidak tergantung keputusan struktural, dan langsung mengurangi friksi daily-use + first-time.

**Jalur 3 — Follow-up patch (setelah precedence utama lock):**
- Data-sync (C3 primary-link, C4 custom attributes, C7 auto-tag) dan composer unification (C5) sebagai patch terpisah.
- SLA hygiene (A4 WoC pause, A7 auto-reply contract, A8 ticket FRT zombie, A9 ticket RLT) masuk backlog SLA setelah A1/A2/A3 lock.

**Ketergantungan kunci:** A3 (canonical AUX) adalah prasyarat untuk C6 (snooze), A7 (auto-reply), dan B3 (member-delete side effect). Jangan mulai fitur turunan sebelum A1/A2/A3 lock.

---

## 6. Cross-Reference (Synthesis ID → Sumber)

| Synthesis ID | Sumber | Synthesis ID | Sumber | Synthesis ID | Sumber |
|---|---|---|---|---|---|
| A1 | IC#1 (T1) | B1 | FT#2 + IC#4 (T4) | D1 | FT#1 |
| A2 | IC#10 (T10) | B2 | FT#3 + FT#6 | D2 | FT#4 |
| A3 | IC#2 (T2) | B3 | IC#7 (T7) | D3 | FT#5 |
| A4 | IC#11 (T11) | B4 | IC#5 (T5) | D4 | FT#7 |
| A5 | IC#12 (T12) | B5 | IC#6 (T6) | D5 | FT#8 + FT#9 |
| A6 | IC#3 (T3) | C1 | IC#13 (T13) | D6 | FT#10 |
| A7 | IC#9 (T9) | C2 | IC#15 (T15) | D7 | FT#11 |
| A8 | IC#18 (T18) | C3 | IC#14 (T14) | D8 | FT#12 |
| A9 | IC#19 (T19) | C4 | IC#16 (T16) | E1..E12 | RT#1..RT#12 (berurutan) |
| | | C5 | IC#17 (T17) | | |
| | | C6 | IC#20 (T20) | | |
| | | C7 | IC#8 (T8) | | |

Legenda: `IC` = interconnection, `FT` = first-time user flow, `RT` = returning user flow.

---

## 7. Open Questions (carry-forward)

| OQ | Pertanyaan | Blocker? |
|---|---|---|
| OQ-01 | Precedence SLA: channel vs ticket-type vs team-inbox mana yang menang? | Ya (A1) |
| OQ-02 | Satu agent reply menyelesaikan conversation FRT dan ticket FRT sekaligus? | Ya (A2) |
| OQ-03 | Reopen conversation → linked ticket ikut reopen? | Ya (A5) |
| OQ-04 | Canonical AUX state: presence "Away" == SLA "AUX"? | Ya (A3) |
| OQ-05 | Apakah conversation assignee divalidasi terhadap Team Inbox seperti ticket? | Tidak (B1) |
| OQ-06 | Model seleksi bubble kanonik (1→1 vs 1→N vs multi→1)? | Ya (C1) |
