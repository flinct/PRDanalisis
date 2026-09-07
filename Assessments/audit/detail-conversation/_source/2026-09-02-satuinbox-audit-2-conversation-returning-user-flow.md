> **FLAG: AUDIT PHASE 2 — USER LAMA (RETURNING / POWER USER)**
> Scope: modul Conversation. Trace daily-use path user lama (agent/supervisor yang tiap hari pakai modul ini).
> Fokus: pengulangan aksi, langkah manual yang harusnya otomatis, load histori percakapan, pencarian, skala banyak conversation.
> Semua lokasi = file:baris yang diverifikasi langsung di FE `omnichannel-satuinbox-fe` (branch `data-cy`, baseline `prod-2.7.0-11`), bukan inferensi PRD/memory.

# Audit Modul Conversation — Flow User Lama (Returning / Power User)

- Tanggal Analisa: 2026-09-02
- Author: Dany Christian
- Repo baseline: FE `omnichannel-satuinbox-fe` branch `data-cy` (prod-2.7.0-11)
- Source of truth: PRD Conversationv2 (V2) + kode FE terverifikasi

## Ringkasan

User lama (agent yang menangani puluhan–ratusan conversation/hari) paling terpukul oleh:
1. Aksi yang terlihat tapi tidak berfungsi (reminder = stub `console.log`).
2. Count unread yang salah hitung saat conversation > 20 (undercount).
3. State pencarian/filter yang hilang setiap ganti view / reload.
4. Load histori yang hanya infinite-scroll 25 pesan/page tanpa lompat/search.
5. List yang tidak auto-refresh setelah socket reconnect (butuh klik manual).

---

## Daftar Temuan

### 1. Reminder quick-action = tombol mati (stub `console.log`)
- Lokasi: `components/molecules/conversations/chat-lists/chat-item/QuickAction.tsx:155-160` (`createReminderAction` → `onClick: () => console.log('reminder')`)
- Dampak: Item "Set Reminder" muncul di menu quick-action tiap card, tapi klik tidak melakukan apa pun. User lama yang mengandalkan reminder untuk menindaklanjuti conversation tertipu oleh aksi mati; tidak ada feedback error maupun hint bahwa fitur belum ada. (Konsisten dengan memory: "Room Reminder" V2 file 9 = undeveloped.)
- Severity: HIGH

### 2. Unread count undercount saat conversation > 20 (doc bilang 100, kode pakai 20)
- Lokasi: `services/conversation/conversation.service.ts:321-343` (`useUnreadAssignedConversationCount`); `hooks/conversation/useManageConversationAPIRequest.ts:157-170` (`getConversations` hardcode `limit: DEFAULTS.LIMIT` = 20, lihat baris 114-116)
- Dampak: Count unread "Your Inbox" (sumber notifikasi badge) dihitung dengan menjumlahkan `unread` dari hasil `getConversations(1, {...})` yang limit-nya 20. Komentar doc di hook menulis `limit=100`, tapi implementasi aktual memakai `DEFAULTS.LIMIT=20`. Saat user lama punya >20 conversation unread ter-assign, badge unread undercount (hanya halaman pertama yang dijumlah). Ini juga fetch list penuh kedua yang redundan (seharusnya count endpoint), menambah beban untuk user berskala besar.
- Severity: HIGH

### 3. Pencarian hilang setiap ganti view (Inbox / Channel / Team)
- Lokasi: `components/molecules/conversations/nav-lists/ConversationNavItemDefault.tsx:224-283` (`handleInboxClick` / `handleChannelClick` / `handleTeamClick` semuanya panggil `resetSearch()`)
- Dampak: User lama yang sedang mencari conversation di satu view, lalu pindah ke Channel/Team/Inbox lain, kehilangan query pencariannya secara diam-diam. Pencarian harus diketik ulang. Tidak ada preservasi query lintas-view.
- Severity: MEDIUM

### 4. Filter tidak persist (kecuali sort) — reset tiap reload
- Lokasi: `stores/conversation/conversationFilter.store.ts:44-49` (`partialize` hanya simpan `sort`); `stores/conversation/conversationAdvancedFilter.store.ts:91` (`partialize: () => ({})` — advanced filter sengaja direset)
- Dampak: Status (open/closed), read (all/unread/read), search, dan advanced filter (agents/tags) semua hilang saat refresh/re-login. User lama yang rutin pakai kombinasi filter yang sama harus re-setup setiap sesi. Hanya `sort` yang diingat.
- Severity: MEDIUM

### 5. Load histori pesan = infinite scroll 25/page, tanpa lompat/search
- Lokasi: `services/conversation/use-message.service.ts:69-83` (`useInfiniteConversationMessages`, `limit = INFO.DEFAULT_LIMIT` = 25); `constants/info.ts:2` (`DEFAULT_LIMIT: 25`); `components/molecules/conversations/chat-room/ConversationChatRoomMessage.tsx:57-84` (infinite scroll reverse)
- Dampak: User lama yang membuka conversation lama / panjang harus scroll naik berulang kali (25 pesan per halaman) untuk membaca konteks historis. Tidak ada jump-to-date, tidak ada search dalam conversation. Untuk returning user yang menangani conversation berumur hari/minggu, ini langkah manual yang sangat repetitif.
- Severity: MEDIUM

### 6. List tidak auto-refresh setelah socket reconnect (stale sampai klik manual)
- Lokasi: `@satuinbox/react-query` `makeQueryClientHelper.ts:11` (referensi register audit PERF-01, `refetchOnReconnect` tidak aktif); UI refresh manual di `hooks/conversation/use-conversation-refresh-notification.ts:35-41` + `ConversationRefreshNotification`
- Dampak: Setelah koneksi socket putus-sambung (umum di environment agent), list conversation tetap stale. User lama harus sadar ada banner "refresh" lalu klik manual untuk sinkron ulang — langkah yang harusnya otomatis. Ketidakakuratan list berdampak langsung ke prioritas kerja (SLA/unread salah).
- Severity: MEDIUM

### 7. Navigasi keyboard parsial (tabIndex ada, handler stub)
- Lokasi: `components/molecules/conversations/chat-lists/chat-item/ConversationCard.tsx` + `hooks/conversation/useChatHandlers.ts` (referensi register audit C4/UX-06: "ConversationCard tabIndex ada, handler stub")
- Dampak: Tidak ada cara keyboard untuk berpindah antar conversation (next/prev), buka room, atau jalankan quick-action. User lama yang bekerja cepat (power user) dipaksa full-mouse untuk triage puluhan conversation. TabIndex ada tapi handler tidak lengkap → a11y dan efisiensi sama-sama turun.
- Severity: MEDIUM

### 8. Histori conversation sama-kontak: 3 level navigasi (list → messages → detail)
- Lokasi: `components/molecules/conversations/chat-detail/content/ConversationHistoryContent.tsx:181-221` (`historyList`/`historyMessages`/`historyDetail` view machine); `.../ConversationHistoryMessages.tsx:112-121` (CTA "view detail" untuk turun 1 level lagi)
- Dampak: Untuk melihat riwayat conversation dengan kontak yang sama, user lama harus turun 3 level (list → pesan → detail) dengan back button manual tiap level. Collapsed view hanya tampil 5 item (MAX_COLLAPSED_ITEMS=5, baris 22) dan fetch max 100 (FETCH_LIMIT=100, baris 25) — kontak dengan >100 riwayat tidak bisa dijelajah penuh.
- Severity: MEDIUM

### 9. Dua endpoint pesan berbeda tanpa cache bersama (live vs history)
- Lokasi: `hooks/conversation/use-messages-api.ts:63-75` (`/conversation/{id}/messages`) vs `hooks/conversation/use-conversation-history-messages-api.ts:54-74` (`/conversation/history/{id}/messages`); `components/molecules/conversations/chat-detail/content/ConversationHistoryMessages.tsx:33-50` (query baru per history item, tanpa shared cache)
- Dampak: Pesan yang sama di-fetch dua jalur berbeda tanpa dedup cache. Membuka history conversation memicu fetch penuh baru (25/page) yang tidak dipakai ulang saat kembali ke room live. Redundansi ini makin terasa untuk user lama yang sering bolak-balik room ↔ history.
- Severity: LOW

### 10. SLA ticker render ulang tiap detik di setiap card terlihat
- Lokasi: `hooks/conversation/useGlobalTicker.tsx:3` (`TICK_INTERVAL_MS = 1000`); `components/molecules/conversations/chat-lists/chat-item/ConversationCard.tsx:197-226` (`DurationBadge` pakai `useGlobalTicker`)
- Dampak: Satu interval global mentrigger re-render semua card SLA yang terlihat tiap detik. Dimitigasi virtualisasi list (`InfiniteVirtualContainer`), tapi pada viewport lebar dengan banyak card ter-render, ini tetap beban komputasi yang tidak perlu untuk user dengan banyak conversation.
- Severity: LOW

### 11. System event ("recipient not available" dll) hanya muncul dalam jendela 1 hari dari pesan tertua ter-load
- Lokasi: `hooks/conversation/use-combined-items.ts:56-64` (filter utilities `>= oldestTimestamp - ONE_DAY_MS`)
- Dampak: Message utility (mis. indikator nomor tidak terdaftar / status sistem) yang lebih lama dari 1 hari sebelum pesan tertua yang sedang ter-load tidak ditampilkan. Saat user lama scroll naik memuat pesan lama, event penting lama bisa muncul-tenggelam tergantung window yang ter-load. Konsistensi timeline tidak stabil.
- Severity: LOW

### 12. Inkonsistensi minimum karakter pencarian (2 vs 3)
- Lokasi: `components/molecules/conversations/chat-lists/ConversationChatListHeader.tsx:24` (`MIN_SEARCH_LENGTH = 2`); komentar baris 158-159 menyebut "minimum 3 characters"
- Dampak: Perilaku aktual memicu pencarian pada 2 karakter, sementara komentar/tujuan menulis 3. Bukan bug user-facing besar, tapi indikasi drift dokumentasi vs implementasi yang bisa membingungkan maintenance dan menghasilkan hint text yang tidak konsisten dengan perilaku.
- Severity: LOW

---

## Catatan Korelasi (bukan temuan baru, sudah tercatat di register audit)

Item berikut sudah ada di `Assessments/audit/core/audit-master-register.md` dan relevan ke user lama, dicatat ulang untuk konteks synthesis, tanpa diduplikasi sebagai temuan baru:
- F-07 (raw error leakage) — register CONFIRMED, Major.
- V3 (SLA color FE absolute vs PRD percentage), V7 (group FRT disembunyikan), V8 (chat list irisan 4-dimensi tanpa compound index), V20 (close/reopen last-write-wins) — register NEEDS-VALIDATION, menyentuh langsung daily-use user lama.
- PERF-01 (refetchOnReconnect) — register CONFIRMED (dijadikan temuan #6 di atas dengan lokasi FE spesifik).

## Rekomendasi Quick-Win vs Big-Fix (dari temuan user lama)

Quick-win (fix kecil, dampak cepat):
- #1 Reminder stub: sembunyikan item "Set Reminder" dari menu sampai fitur benar-benar ada (hapus dead-end) — 1 baris.
- #2 Unread undercount: samakan limit dengan doc (100) ATAU pakai count endpoint; jangan fetch list untuk hitung badge.
- #3/#4 Preservasi search & persist filter: simpan `search` di store/persist seperti `sort`, dan jangan `resetSearch()` saat ganti view.
- #6 refetchOnReconnect: aktifkan 1 baris konfigurasi.

Big-fix (perlu effort):
- #5/#8/#9: pencarian dalam conversation + jump-to-date + unifikasi endpoint live/history + cache bersama.
- #7: keyboard navigation penuh (next/prev conversation, quick-action via keyboard).
- #10/#11: revisi arsitektur ticker (deadline-based, bukan per-detik) dan window utility event berbasis rentang load penuh.
