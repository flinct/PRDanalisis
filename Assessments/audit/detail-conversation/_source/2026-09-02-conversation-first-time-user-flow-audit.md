# Audit — Flow User Baru di Modul Conversation (First-Time User Flow)

| Field | Value |
|---|---|
| Tipe Audit | UX / First-Time User Flow — modul Conversation |
| Repo Referensi FE | `omnichannel-satuinbox-fe` (branch `v2.8.0`, prod `prod-2.7.0.3`) |
| Sumber Verifikasi | Kode FE (file:line dibaca langsung) + `Memory/global-memory.md` |
| Tanggal Audit | 2026-09-02 |
| Status | Selesai (daftar temuan) |

## Ringkasan

Alur user baru di modul Conversation punya dua celah besar: (1) **empty state tanpa CTA** — user baru yang belum punya percakapan/kanal tidak diarahkan ke langkah berikutnya, dan (2) **assignment/ownership belum terlihat** — `participants` (assignee) masih `[]` sehingga agen tidak melihat dirinya sebagai pemilik percakapan. Onboarding yang ada hanya verifikasi KYC organisasi, bukan panduan pakai inbox.

Temuan bernomor di bawah, tiap item: lokasi (screen/komponen/file) + dampak ke user + severity (high/med/low).

---

## Temuan

### 1. Empty state chat list tanpa CTA lanjutan — HIGH
- **Lokasi:** `components/molecules/conversations/chat-lists/EmptyChat.tsx` (komponen `EmptyConversation`); copy di `packages/i18n/.../conversation/*.json` (`emptyState.chatList`).
- **Kondisi:** Saat belum ada percakapan, tampil ikon + judul "Belum Ada Percakapan" + deskripsi "Anda belum memiliki percakapan aktif saat ini." — **tanpa tombol aksi apapun** (tidak ada "Hubungkan kanal", "Buat percakapan", "Tarik percakapan", "Ajak tim").
- **Dampak:** User baru (organisasi yang baru approve onboarding, belum connect WhatsApp Web, belum ada chat masuk) mendarat di layar buntu. Tidak ada petunjuk langkah berikutnya → bingung, tidak tahu produk harus dipakai dari mana.
- **Severity:** high.

### 2. Assignee/ownership tidak terlihat (participants = [] undeveloped) — HIGH
- **Lokasi:** Detail sidebar `components/molecules/conversations/chat-detail/` (bagian assignee) + BE field `participants`; ditegaskan di `Memory/global-memory.md` ("`participants` = assignee. Currently `[]` (Assignee & Collaborator undeveloped)") dan "Detail assignment state derived from `participants.length === 0` = unassigned".
- **Kondisi:** Percakapan yang sudah di-assign (atau di-pull) ke agen tidak menampilkan agen sebagai assignee karena field `participants` masih kosong. UI derive "Unassigned" dari `participants.length === 0`.
- **Dampak:** Agen baru ragu kepemilikan ("ini chat-ku atau bukan?"), bisa dobel-pull / dobel-reply, dan supervisor tidak bisa membaca siapa yang menangani. Titik bingung krusial di percakapan pertama.
- **Severity:** high.

### 3. "Pull Conversation" tersembunyi untuk agen di organisasi round-robin — HIGH (MED-HIGH)
- **Lokasi:** `components/molecules/conversations/chat-lists/ConversationChatLists.tsx` (hook `useShowPullButton`) + `PullButton.tsx`.
- **Kondisi:** Tombol pull hanya tampil jika `your-inbox` + role AGENT + `organization.roundRobin === false`. Tab "Unassigned" juga disembunyikan untuk agen (lihat temuan 6).
- **Dampak:** Agen baru di organisasi dengan round-robin aktif tidak punya jalur terlihat untuk mengambil percakapan pertama dari Your Inbox; kalau inbox kosong, tidak ada penjelasan kenapa kosong atau bagaimana chat masuk. User baru merasa "tidak ada kerjaan / produk rusak".
- **Severity:** high (kombinasi dengan #6 = dead-end untuk role AGENT).

### 4. Chat room empty state = gambar tanpa teks/label — MED
- **Lokasi:** `components/molecules/conversations/chat-room/ConversationChatRoomEmpty.tsx` (+ wrapper `chat-room-content/EmptyState.tsx`).
- **Kondisi:** Saat belum ada percakapan dipilih, area tengah hanya menampilkan `Image` ilustrasi dengan `alt="No conversation selected."` — tanpa judul/instruksi terlihat. Berbeda dengan empty state chat list yang punya teks.
- **Dampak:** Area tengah terasa "kosong/hilang", tidak mengajarkan user bahwa ini area chat dan cara memilih percakapan. Inconsistency antar empty state menambah kebingungan.
- **Severity:** med.

### 5. Tanpa onboarding/panduan in-product di modul conversation — MED
- **Lokasi:** (absence) — grep `tour / coachmark / firstTime / guide / hasSeen` di `components/molecules/conversations/` tidak menemukan apa pun.
- **Kondisi:** Tidak ada guided tour, coachmark, atau petunjuk langkah pertama untuk inbox. Satu-satunya "onboarding" adalah form verifikasi organisasi (KYC), tidak menyentuh cara pakai conversation sama sekali.
- **Dampak:** Learning curve penuh ditanggung user baru; fitur penting (filter, assign, bulk, SLA) tidak pernah diperkenalkan.
- **Severity:** med.

### 6. Tab Unassigned/All disembunyikan untuk AGENT tanpa penjelasan — MED
- **Lokasi:** `components/molecules/conversations/nav-lists/ConversationNavItemDefault.tsx` (hook `useInboxItems`, `show: !isAgent`).
- **Kondisi:** Agen hanya melihat Your Inbox, Spam, Starred, Junk. Unassigned & All tidak muncul dan tidak ada hint bahwa tab itu ada untuk role lain.
- **Dampak:** Digabung #3, agen baru dengan inbox kosong terjebak tanpa konteks bahwa ada antrean di tempat lain. Tidak ada guidance RBAC untuk role-nya.
- **Severity:** med.

### 7. Peringatan "Tidak Ada Nomor Terhubung" hanya muncul setelah membuka percakapan — MED
- **Lokasi:** `components/molecules/conversations/chat-room/ConversationChatRoomNoSession.tsx`, `DisconnectedAccountBanner.tsx`, `chat-room-content/Input.tsx` (`isAllChannelsInactive`).
- **Kondisi:** Banner "no-session / channel terputus" dirender di dalam chat room. Di level list tidak ada indikasi bahwa kanal belum terhubung / tidak bisa kirim.
- **Dampak:** Organisasi baru yang belum connect WhatsApp Web harus membuka sebuah chat dulu untuk tahu mereka tidak bisa membalas. Setup kanal tidak di-prompt secara proaktif di titik masuk.
- **Severity:** med.

### 8. Gate onboarding hanya verifikasi KYC, tanpa setup conversation — MED
- **Lokasi:** `proxy.ts` (`handleOnboardingRedirect`) + `components/pages/ManageOnboardingPage.tsx` + `OnboardingForm.tsx`.
- **Kondisi:** Setelah approve, user diarahkan ke dashboard tanpa guided setup conversation (connect channel, team inbox, SLA, shift hours). Setting default ini semuanya opsional dan diam-diam kosong.
- **Dampak:** Admin baru tidak tahu urutan setup; SLA/shift hours kosong → metrik dan banner jam kerja tidak berfungsi sebagaimana mestinya sejak hari pertama.
- **Severity:** med.

### 9. Default setting kosong tanpa nudge (shift hours / SLA) — MED
- **Lokasi:** `settings/Organization/ManageOfficeHourPage.tsx` (shift-hours), `settings/general-sla/ManageGeneralSLAPage.tsx` (SLA); konsumennya `OutsideWorkHoursBanner.tsx` yang bergantung pada `member status` + `roundRobin`.
- **Kondisi:** `OutsideWorkHoursBanner` hanya muncul saat round-robin aktif + di luar jam kerja member; kalau shift hours belum diset, perilaku tidak jelas dan tidak ada prompt "lengkapi shift hours".
- **Dampak:** Agent baru bisa menerima chat tanpa batas jam kerja yang dikonfigurasi, atau bingung kenapa banner muncul/hilang. Default tidak diinisialisasi dengan nilai aman.
- **Severity:** med.

### 10. String error "Conversation not found." hardcoded (bukan next-intl, dan bahasa Inggris) — LOW
- **Lokasi:** `components/molecules/conversations/chat-room/chat-room-content/InvalidState.tsx`.
- **Kondisi:** Teks error dirender literal `<p>Conversation not found.</p>` — melanggar aturan "semua user-facing string lewat next-intl" dan tampil Inggris di locale default `id`. Tidak ada tombol retry/back.
- **Dampak:** User baru yang membuka link/battlemark percakapan yang sudah dihapus mendapat pesan asing tanpa aksi pemulihan.
- **Severity:** low.

### 11. Account channel selector fallback ke kanal pertama walau inactive — LOW (MED)
- **Lokasi:** `components/molecules/conversations/chat-room/account-channel-selector/AccountChannelSelector.tsx` (`selectedId` fallback ke `accountChannels[0].id`).
- **Kondisi:** Kalau akun pertama tidak aktif (`connectionStatus !== 'active'`), selector tetap memilihnya, tampil background merah + pesan "pilih nomor lain", dan tombol kirim nonaktif.
- **Dampak:** User baru dengan multi-nomor (satu siaga) bingung kenapa tidak bisa kirim padahal ada nomor lain yang aktif; harus tahu sendiri mengganti nomor.
- **Severity:** low (naik jadi med untuk org multi-akun).

### 12. Risiko layar kosong pada halaman onboarding untuk status tidak dikenal — LOW
- **Lokasi:** `components/pages/ManageOnboardingPage.tsx` (hanya render untuk `ONBOARDING` dan `WAITING_APPROVAL`, selain itu return `undefined`).
- **Kondisi:** `proxy.ts` redirect ke `/onboarding` hanya saat `onboardingStatus` truthy && `!== 'approved'`. Kalau token tidak membawa `onboardingStatus` (misal user lama/sesi parsial) dan user mengunjungi `/onboarding`, halaman render kosong tanpa feedback.
- **Dampak:** Layar putih/kosong, user tidak tahu harus apa. Edge case kecil.
- **Severity:** low.

---

## Kesimpulan Cepat (prioritas eksekusi)

1. **#1 + #4** — Empty state perlu CTA kontekstual (connect channel / tarik percakapan / ajak tim) dan konsistensi teks antara list & room.
2. **#2** — Assignee `participants` harus diimplementasi agar ownership terlihat; ini krusial untuk trust percakapan pertama.
3. **#3 + #6** — Jalur akses percakapan pertama untuk role AGENT harus selalu ada dan dijelaskan (pull vs round-robin vs unassigned), bukan disembunyikan diam-diam.
4. **#7 + #8 + #9** — Setup pasca-approve (channel, team inbox, shift hours, SLA) perlu panduan/nudge terstruktur, bukan default kosong senyap.
5. **#10 + #11 + #12** — Cacat kecil (i18n, fallback selector, layar kosong) yang murah diperbaiki dan langsung mengurangi friksi.
