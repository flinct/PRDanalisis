# Assessment Report — Conversation List Deep Audit (multi-aspect, code-verified)

Tanggal: 2026-09-07
Author: Analyst (analyzer role, PRDanalisis multi-agent audit workflow)
Version: 1.0
Scope: section **conversation-list** SatuInbox — panel chat list saja (`chat-lists/` + supporting hooks/stores/services + BE endpoint yang melayani list & bulk action). **Message thread / chat room di luar scope.**
Artifact class: **detail-\* deep-dive**. Dokumen ini **TIDAK di-fold ke `01-audit-master-register.md`** kecuali user/orchestrator eksplisit minta fold. `01-register` tetap single source of truth untuk corpus-level register; file ini adalah raw evidence layer per `Rules/core/audit.md` §1.
ID prefix baru: **CLX-**.

## Relasi ke audit sebelumnya

`2026-09-04-conversation-list-audit.md` (CL-01..CL-07) diperlakukan **KNOWN** dan tidak diturunkan ulang:

| KNOWN | Ringkas | Perlakuan di dokumen ini |
|---|---|---|
| CL-01 | FE re-sort lokal vs server pagination | KNOWN. Diperluas oleh **CLX-03** (mekanisme baru: index mismatch virtualizer, bukan hanya urutan) |
| CL-02 | Filter count tidak scoped | KNOWN, tidak diulang |
| CL-03 | Partial persist filter store | KNOWN. Disinggung oleh **CLX-13** (advanced-filter store tidak persist sama sekali → inkonsistensi kedua) |
| CL-04 | Team-view invalidation mismatch | KNOWN, tidak diulang |
| CL-05 | Prefetch `hideEmpty` | KNOWN, tidak diulang |
| CL-06 | flatMap scan per event | KNOWN, tidak diulang |
| CL-07 | Error-state list | KNOWN. Diperluas oleh **CLX-23** (bukti konkret: container membuang `noDataError` di branch error dan hardcode string) |

---

## Findings

### Aspek 1 — Item rendering (ConversationCard, avatar, unread badge, preview, timestamp, indikator, channel icon)

### CLX-01 — P1 High — DEFECT — Mention badge memakai CSS class yang tidak pernah didefinisikan → indikator `@mention` tampil tanpa styling

**Status:** Confirmed
**Location:** FE `chat-lists/chat-item/ConversationCard.tsx` (ConversationIndicators)
**Scenario:** conversation punya `unreadMentionCount > 0` (agent di-mention dalam WA group / internal note). Card merender badge `@`.
**Expected:** badge `@` tampil sebagai pill ber-styling seperti unread badge (`MESSAGE_UNREAD_BADGE`), konsisten dengan indikator lain.
**Actual / Failure Mode:** `CLS.MESSAGE_MENTION_BADGE` **tidak ada** di object `CLS`. Object `CLS` dideklarasikan `as const` (`ConversationCard.tsx:53-75`) dan hanya berisi `CARD*`, `DURATION_BADGE`, `MESSAGE_LEFT`, `MESSAGE_ROW`, `MESSAGE_UNREAD_BADGE`, `META_ROW`, `META_TIME`, `PHONE_BADGE`, `TITLE_ROW`, `TITLE_TEXT`, `TOP_ROW`. Akses `CLS.MESSAGE_MENTION_BADGE` menghasilkan `undefined` → `className={undefined}` → karakter `@` mentah tanpa background/ukuran/warna, berdempet dengan unread badge.
**Root Cause:** class key ditambahkan di JSX tanpa menambah entri di const map; TypeScript **seharusnya** menangkap ini (`as const` object, property tidak ada). Fakta bahwa kode ini ada di repo mengindikasikan salah satu: build type-check di-skip untuk file ini, atau ada `eslint-disable`/loose typing di jalur ini (file dibuka dengan `/* eslint-disable complexity, max-lines-per-function */` di `:3`). Perlu konfirmasi CI type-check (lihat Open Questions).
**Evidence:**
- `ConversationCard.tsx:464` — `<div className={CLS.MESSAGE_MENTION_BADGE} aria-label="mentioned">`
- `ConversationCard.tsx:53-75` — definisi `CLS`, **tidak ada** key `MESSAGE_MENTION_BADGE`
- grep repo-wide: `grep -rn "MESSAGE_MENTION_BADGE" --include=*.tsx --include=*.ts` → **1 hit saja** (baris 464 di atas), tidak ada definisi di mana pun.
**Impact:** indikator mention (fitur kolaborasi/eskalasi) tampil rusak secara visual; agent bisa melewatkan mention. Juga sinyal bahwa type-safety pada jalur render item tidak menjaring regresi kelas ini.
**Blast Radius:** semua conversation dengan mention (WA group + internal note), semua role, semua tenant. Sekaligus risiko sistemik: gate type-check yang bolong berlaku ke seluruh file.
**Recommendation:** tambahkan `MESSAGE_MENTION_BADGE` ke `CLS` dengan style setara unread badge; lalu verifikasi kenapa `tsc --noEmit` tidak menolak property tidak dikenal pada object `as const` (cek `skipLibCheck`/`ignoreBuildErrors` di `next.config`, dan apakah CI menjalankan type-check pada `apps/omnichannel`).
**Suggested Test:** seed conversation dengan `unreadMentionCount = 2`, render list, assert badge mention punya computed background-color != transparent dan width >= 16px. Plus satu unit/type test: `tsc --noEmit` harus gagal jika key CLS dihapus.

### CLX-02 — P2 Medium — DEFECT — Unread badge tanpa overflow cap: count 4-5 digit merusak layout row

**Status:** Confirmed
**Location:** FE `ConversationCard.tsx` ConversationIndicators
**Scenario:** conversation lama / WA group ramai / email thread dengan ratusan-ribuan pesan belum terbaca. `chat.unread` bernilai mis. 1284.
**Expected:** count dibatasi (pola umum `99+`), badge tetap lebar tetap, tidak menekan preview last-message.
**Actual / Failure Mode:** badge merender `{chat.unread}` mentah (`ConversationCard.tsx:474`) dengan class `ml-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-100 ...` (`:64-66`). `min-w-6` hanya lower bound — tidak ada `max-w`, tidak ada truncation, tidak ada clamp. Badge tumbuh horizontal. Container indikator `flex items-center gap-1 shrink-0` (`:455`) → **tidak boleh menyusut**, sedangkan sisi kiri `MESSAGE_LEFT` = `flex flex-1 items-center gap-1 min-w-0` (`:62`) yang menyusut. Efeknya preview last-message terkompres, pada panel selebar `max-w-[400px]` (`ConversationChatLists.tsx:180`) preview bisa hampir hilang.
**Root Cause:** tidak ada display-cap pada nilai counter yang unbounded dari server.
**Evidence:**
- `ConversationCard.tsx:468-476` — badge render `{chat.unread}` tanpa cap
- `ConversationCard.tsx:64-66` — `MESSAGE_UNREAD_BADGE` hanya `min-w-6`, tanpa `max-w`/truncate
- `ConversationCard.tsx:455` — wrapper indikator `shrink-0`
- `ConversationCard.tsx:62` — `MESSAGE_LEFT` `flex-1 min-w-0` (yang menjadi korban penyusutan)
- `ConversationChatLists.tsx:180` — panel `w-1/3 max-w-[400px]`
**Impact:** degradasi UX pada inbox berat; preview pesan (informasi utama triage) tidak terbaca.
**Blast Radius:** agent dengan backlog besar, group chat, email thread panjang.
**Recommendation:** clamp display: `unread > 99 ? '99+' : unread`, dan tambahkan `max-w` + `tabular-nums`. Simpan nilai asli di `title`/`aria-label` agar SR tetap dapat angka tepat.
**Suggested Test:** render card dengan `unread = 12345`; assert teks badge = `99+` dan `aria-label` mengandung angka penuh; assert lebar preview last-message > 0.5 × lebar konten.

### CLX-03 — P1 High — DEFECT — `formatData` mengubah panjang array sementara virtualizer memakai `allRows.length` → row hilang / blank row (memperluas CL-01 dengan mekanisme baru)

**Status:** Confirmed
**Location:** FE `packages/ui/src/components/molecules/InfiniteVirtualContainer.tsx` × `ConversationChatLists.tsx`
**Scenario:** user mengaktifkan filter **Unread only** di conversation list. Server mengembalikan page berisi campuran read+unread (BE tidak selalu memfilter unread — FE yang memfilter, lihat evidence). `handleFormatConversationLists` membuang item read sehingga `processedRows.length < allRows.length`.
**Expected:** jumlah row tervirtualisasi, deteksi "last item", dan mapping index selalu konsisten dengan array yang benar-benar dirender (`processedRows`).
**Actual / Failure Mode:** container mencampur dua sumber panjang:
- `count` virtualizer = `processedRows.length` (+1 bila `hasNextPage`) — `:117`
- deteksi infinite-scroll trigger = `lastItem.index >= allRows.length - 1` — `:172`
- deteksi loader row = `virtualData.index > allRows.length - 1` — `:231`
- akses data = `processedRows[virtualData.index]` — `:232`

Ketika `processedRows.length < allRows.length` (unread filter membuang item):
1. `isLastItemVisible` **tidak pernah true** karena index maksimum yang mungkin dari virtualizer adalah `processedRows.length` (< `allRows.length - 1` saat pembuangan ≥ 2 item) → **`fetchNextPage()` tidak pernah dipanggil**. Infinite scroll mati: user melihat hanya page-1 hasil filter unread meski masih ada halaman berikutnya.
2. Baris loader tidak pernah muncul (`virtualData.index > allRows.length - 1` juga tidak tercapai) → tidak ada indikasi "masih ada data".
3. Untuk `hasNextPage === true`, `count = processedRows.length + 1` sedangkan `processedRows[processedRows.length]` = `undefined` → `if (!data) return null` (`:233`) → satu slot virtual bertinggi `estimateSize` dirender kosong (spacer height tetap dihitung `getTotalSize()`), muncul gap di akhir list.
**Root Cause:** kontrak `formatData` diizinkan mengubah kardinalitas array, tetapi container mempertahankan `allRows.length` sebagai referensi pagination/loader. Tidak ada invariant `processedRows.length === allRows.length`.
**Evidence:**
- `ConversationChatLists.tsx:203-205` — `formatData={(datas) => handleFormatConversationLists(datas, filters.unreadOnly ?? false, filters.sort ?? '')}`
- `ConversationChatLists.tsx:82-84` — `if (unread) { filteredChats = data.filter((chat) => chat.unread && chat.unread > 0) }` ← **mengurangi panjang array**
- `InfiniteVirtualContainer.tsx:110-114` — `allRows` (flatten) vs `processedRows` (hasil `formatData`)
- `InfiniteVirtualContainer.tsx:117` — `count: hasNextPage ? processedRows.length + 1 : processedRows.length`
- `InfiniteVirtualContainer.tsx:172-175` — `const isLastItemVisible = lastItem.index >= allRows.length - 1` → gate `fetchNextPage()`
- `InfiniteVirtualContainer.tsx:231-233` — `isLoaderData` pakai `allRows.length`, data diakses dari `processedRows`
**Impact:** dengan filter Unread aktif, list berhenti memuat data lebih lanjut (silent). User menyimpulkan "tidak ada unread lagi" padahal ada. Ini kegagalan fungsional triage, bukan kosmetik.
**Blast Radius:** semua user yang memakai Unread-only filter; juga **setiap** konsumen `InfiniteVirtualContainer` lain yang `formatData`-nya memfilter (shared component di `packages/ui`, blast radius lintas modul).
**Recommendation:** satu perbaikan di shared container (root cause, bukan per-caller): gunakan `processedRows.length` konsisten untuk `count`, `isLastItemVisible`, dan `isLoaderData`; atau larang `formatData` mengubah panjang dan pindahkan filter unread ke query param server (`read`/`unreadOnly`) sehingga server yang memangkas dan pagination tetap benar. Opsi kedua sekaligus menutup CL-01.
**Suggested Test:** dataset 2 page × 20 item di mana hanya 3 item per page unread; aktifkan Unread-only; scroll ke dasar; assert `fetchNextPage` terpanggil dan total item unread yang tampil = 6, bukan 3.

### CLX-04 — P2 Medium — DEFECT — Virtual row `key={virtualData.index}` → state per-row (hover, checkbox visibility, popover open) bocor antar conversation saat list bergeser

**Status:** Confirmed
**Location:** FE `InfiniteVirtualContainer.tsx` row wrapper
**Scenario:** agent hover row #3 (checkbox muncul, QuickAction popover terbuka). Datang pesan baru → item baru masuk di posisi 0 setelah refetch/re-sort (`handleFormatConversationLists` mengurut ulang). Index 3 sekarang menunjuk conversation yang berbeda.
**Expected:** identitas row terikat ke conversation id, sehingga state lokal row (hover, popover open, checkbox terlihat) ikut pindah bersama datanya atau reset bersih.
**Actual / Failure Mode:** wrapper row memakai `key={virtualData.index}` (`InfiniteVirtualContainer.tsx:264`) — **key positional**. React mempertahankan instance komponen di posisi itu dan hanya mengganti props. `ChatCard` memang `React.memo` dengan key `data.id` di dalam renderer (`ConversationChatLists.tsx:58-59`), tetapi key itu berada di dalam wrapper yang sudah ber-key positional, sehingga rekonsiliasi terjadi per-posisi: subtree tidak di-unmount. State di `useChatCardHandlers` (`useChatHandlers.ts:10` `const [isHovered, setIsHovered] = useState(false)`) dan `useState(false)` untuk popover di `QuickAction.tsx:272` **tetap** terbawa ke conversation yang baru menempati posisi tersebut.
**Root Cause:** key positional pada list yang urutannya tidak stabil (diperparah oleh re-sort lokal CL-01).
**Evidence:**
- `InfiniteVirtualContainer.tsx:264` — `key={virtualData.index}`
- `ConversationChatLists.tsx:58-64` — `<ChatCard key={data.id} ... />` (key di dalam, tidak menolong rekonsiliasi wrapper)
- `useChatHandlers.ts:9-13` — state hover lokal + `showCheckbox = isHovered || hasSelection || isBulkSelected`
- `QuickAction.tsx:271-272` — `const [open, setOpen] = useState(false)` popover per-row
- `ConversationChatLists.tsx:87-109` — re-sort yang bisa memindahkan item antar posisi
**Impact:** QuickAction popover yang sedang terbuka dapat "berpindah" ke conversation lain. Karena setiap action di popover terikat `chat` dari props terbaru (`useConversationActions` deps `[chat, ...]`, `QuickAction.tsx:265`), user bisa mengklik menu yang dilihatnya untuk conversation A tetapi eksekusi terjadi pada conversation B — **aksi destruktif** (Junk, Close, Spam) di objek yang salah.
**Blast Radius:** semua user; probabilitas naik pada inbox realtime ramai. Risiko integritas data (junk/close salah target), bukan hanya visual.
**Recommendation:** ganti ke key stabil berbasis identitas data pada wrapper container (`key={getRowKey?.(data) ?? virtualData.index}`, dengan conversation list mengirim `(d) => d.id`). Tambahan mitigasi langsung di list: tutup popover QuickAction saat `chat.id` berubah (`useEffect(() => setOpen(false), [chat.id])`).
**Suggested Test:** buka QuickAction pada item posisi 3; simulasikan socket new-message pada item posisi 8 sehingga naik ke posisi 0; assert popover tertutup ATAU popover masih terikat pada conversation id yang sama seperti saat dibuka.

### CLX-05 — P3 Low — DESIGN FLAW — `getChannelIcon` fallback menyamarkan channel tak dikenal sebagai Live Chat; 3 platform code tidak punya ikon

**Status:** Confirmed
**Location:** FE `ConversationCard.tsx` `getChannelIcon`
**Scenario:** conversation dari `facebook`, `facebook_messenger`, atau `telegram` (ketiganya ada di `PLATFORM_CODE`).
**Expected:** ikon channel merepresentasikan channel sebenarnya, atau ikon "unknown" yang netral — tidak boleh mengklaim channel yang salah.
**Actual / Failure Mode:** map `icons` hanya berisi EMAIL, WIDGET, WHATSAPP_API, WHATSAPP_WEB, INSTAGRAM (`ConversationCard.tsx:112-124`). Fallback `icons[code] ?? icons[PLATFORM_CODE.WIDGET]` (`:126`) membuat Facebook/Messenger/Telegram tampil sebagai **ikon Live Chat biru** — informasi salah, bukan informasi hilang. Tambahan inkonsistensi: default channel code di `TopRow` adalah `'live-chat'` (`:141`) yang **bukan** anggota `PLATFORM_CODE` (nilai widget = `'widget'`), sehingga lookup untuk conversation tanpa channel juga jatuh ke fallback lewat jalur string yang tidak pernah cocok.
**Root Cause:** mapping partial + fallback optimistis, bukan fallback eksplisit "unknown".
**Evidence:**
- `ConversationCard.tsx:110-127` — map ikon + fallback
- `ConversationCard.tsx:141` — `const channelCode = isNotConversationInfo ? (chat.channel?.platform?.code ?? 'live-chat') : ''`
- `apps/omnichannel/constants/settings/channel.constant.ts:1-10` — `PLATFORM_CODE` memuat FACEBOOK, FACEBOOK_MESSENGER, TELEGRAM, yang tidak ada di map ikon
**Impact:** salah identifikasi channel saat triage; agent bisa memilih tone/SLA/template yang salah.
**Blast Radius:** tenant yang mengaktifkan FB/Messenger/Telegram. Perlu konfirmasi apakah channel tersebut sudah GA (lihat Open Questions) — jika belum, severity turun ke P4.
**Recommendation:** lengkapi map untuk semua `PLATFORM_CODE`; ganti fallback ke ikon netral (mis. `IconMessageCircle`) + `title` berisi code mentah. Ganti literal `'live-chat'` dengan `PLATFORM_CODE.WIDGET`.
**Suggested Test:** parameterized test atas seluruh nilai `PLATFORM_CODE`; assert tidak ada dua platform berbeda memetakan ke ikon identik, dan platform tak dikenal memetakan ke ikon unknown.

### CLX-06 — P3 Low — DEFECT — Preview last-message tidak melakukan sanitisasi/strip HTML untuk conversation email

**Status:** Confirmed (FE), backend mitigation partial
**Location:** FE `packages/ui/src/components/molecules/LatestMessage.tsx` × `ConversationCard.tsx` `getLatestMessage`
**Scenario:** conversation email di mana `latestMessage.content` berisi teks yang berasal dari body email (bisa membawa entity/markup, whitespace, atau tag literal).
**Expected:** preview satu baris berisi teks bersih (tag distrip, entity di-decode, whitespace dinormalisasi).
**Actual / Failure Mode:** `getLatestMessage` mengembalikan `chat.latestMessage?.content` mentah (`ConversationCard.tsx:334-337`); `LatestMessage` merendernya sebagai text node `{content}` dengan `title={content}` (`LatestMessage.tsx:26-28`). **Tidak ada XSS**: React meng-escape text node, tidak ada `dangerouslySetInnerHTML` di jalur ini — jadi klaim "HTML injection via preview" **tidak terkonfirmasi** untuk komponen ini (lihat Aspek 9). Yang nyata adalah masalah kualitas render: tag/entity tampil literal (`&nbsp;`, `<div>`) dan tidak ada normalisasi whitespace/newline, sehingga preview email terlihat kotor dan `title` tooltip bisa memuat ribuan karakter.
**Root Cause:** tidak ada text-normalization layer antara `content` dan preview; asumsi bahwa BE selalu menyediakan plain text.
**Evidence:**
- `ConversationCard.tsx:334-337` — `getLatestMessage` mengembalikan `content` tanpa transformasi
- `LatestMessage.tsx:22-29` — render `{content}` sebagai text node, `title={content}` (escape aman, tapi tanpa strip/normalize)
- Audit 2026-09-04 §Executive Summary mencatat BE memangkas `latestMessage.htmlContent` pada list — artinya `content` (bukan `htmlContent`) memang yang dipakai; kualitas plain-text-nya tergantung pipeline ingest email. **NEEDS-VALIDATION:** apakah `content` untuk email selalu hasil html-to-text di ingest, atau kadang berisi markup. Belum diverifikasi di repo BE dalam pass ini.
**Impact:** preview email berpotensi tidak informatif; tooltip `title` sangat panjang.
**Blast Radius:** conversation channel email.
**Recommendation:** normalisasi di satu titik (`getLatestMessage`): strip tag, decode entity, collapse whitespace, truncate ke ~140 char untuk `title`. Lakukan di FE walaupun BE juga diperbaiki (defense in depth untuk data historis).
**Suggested Test:** render card dengan `latestMessage.content = '<p>Hello&nbsp;&nbsp;<b>world</b></p>\n\nregards'`; assert teks preview = `Hello world regards` dan `title.length <= 160`.

### CLX-07 — P3 Low — INCONSISTENCY — Avatar image gagal-load pada ticket/group tidak pernah dicoba; inisial tidak menangani nama non-alfabet

**Status:** Confirmed
**Location:** FE `chat-item/AvatarWithFallback.tsx`
**Scenario:** (a) conversation `isTicket`/`isGroup` yang **punya** `contactInfo.avatar` valid; (b) contact dengan `displayName` berupa emoji/CJK/whitespace saja.
**Expected:** (a) kebijakan avatar untuk ticket/group didokumentasikan; (b) inisial deterministik dan tidak kosong.
**Actual / Failure Mode:**
- (a) `shouldShowAvatar = avatar && !isTicket && !isGroup` (`AvatarWithFallback.tsx:64`) → avatar kontak **selalu** dibuang untuk ticket/group, diganti ikon. Ini keputusan desain yang sah, tetapi tidak konsisten dengan `ChatCardCheckboxOrAvatar` yang tetap meneruskan `avatar` (`ChatCardCheckboxOrAvatar.tsx:71-77`) — prop dead pada dua kasus itu.
- (b) `getInitials` mengambil `part.charAt(0)` (`:26`). `charAt` bekerja pada **UTF-16 code unit**, bukan code point. Nama yang dimulai emoji/surrogate pair (mis. `"🙂 Budi"`) menghasilkan **half surrogate** → render sebagai replacement char `�`. Nama berisi hanya whitespace lolos guard `if (!fullName)` (string non-empty) → `split(/\s+/)` pada `''.trim()` menghasilkan `['']` → `charAt(0)` = `''` → inisial **string kosong**, fallback avatar tampil blank.
**Root Cause:** guard hanya menangani falsy, bukan blank; ekstraksi karakter tidak Unicode-aware.
**Evidence:**
- `AvatarWithFallback.tsx:21-30` — `getInitials`, `charAt(0)`, guard `if (!fullName) return '?'`
- `AvatarWithFallback.tsx:64` — `shouldShowAvatar` membuang avatar untuk ticket/group
- `ChatCardCheckboxOrAvatar.tsx:71-77` — tetap meneruskan `avatar` walau akan dibuang
- `ConversationCard.tsx:547-558` — pemanggil meneruskan `chat.contactInfo.avatar` tanpa kondisi
**Impact:** avatar blank / karakter rusak untuk sebagian contact (WA display name emoji lazim di Indonesia).
**Blast Radius:** subset contact; kosmetik namun terlihat.
**Recommendation:** `getInitials`: `const parts = fullName.trim().split(/\s+/).filter(Boolean); if (!parts.length) return '?'` dan gunakan `[...part][0]` (iterator code-point) alih-alih `charAt(0)`.
**Suggested Test:** table test `getInitials`: `''`→`?`, `'   '`→`?`, `'🙂 Budi'`→`🙂B` (bukan `�`), `'Budi Santoso'`→`BS`.

### CLX-08 — P3 Low — DEFECT — `TagList` menampilkan 3 tag tetapi dokumentasi/kontrak menyatakan 4; overflow tooltip tidak dibatasi

**Status:** Confirmed
**Location:** FE `chat-item/TagList.tsx`
**Scenario:** conversation dengan 25 tag.
**Expected:** perilaku terdokumentasi benar; tooltip overflow bounded.
**Actual / Failure Mode:** `MAX_VISIBLE_TAGS = 3` (`TagList.tsx:13`) sementara docblock menyatakan "Displays up to `MAX_VISIBLE_TAGS` (default: 4) tags" (`:65`) — dokumentasi salah, membuat test/QA expectation keliru. `RemainingTag` merender **seluruh** sisa tag di dalam tooltip (`:48-52`, sumber `tags.slice(MAX_VISIBLE_TAGS)` di `:84`) tanpa cap; dengan 25 tag tooltip berisi 22 baris pada `max-w-40`. Tambahan: key `` `${tag.tagId}_${index}` `` (`:93`) mencampur id dengan index — jika `tagId` unik, index redundan; jika tidak unik, key tetap tidak stabil saat urutan berubah.
**Root Cause:** konstanta diubah tanpa memperbarui docblock; tooltip tanpa batas jumlah.
**Evidence:**
- `TagList.tsx:13` — `const MAX_VISIBLE_TAGS = 3`
- `TagList.tsx:62-67` — docblock "default: 4"
- `TagList.tsx:82-84` — `visibleTags`/`remaining`/`tagRemaining`
- `TagList.tsx:48-52` — tooltip merender seluruh `tags` sisa
- `TagList.tsx:93` — key `${tag.tagId}_${index}`
**Impact:** ekspektasi QA/automation salah; tooltip sangat tinggi pada tenant yang gemar tagging.
**Blast Radius:** kosmetik + test-drift.
**Recommendation:** perbaiki docblock ke nilai aktual (atau jadikan prop), cap tooltip ke mis. 10 + "…+N lainnya", key = `tag.tagId` saja.
**Suggested Test:** render 25 tag; assert 3 chip terlihat, badge `+22`, tooltip maksimal 10 baris + baris ringkasan.

### CLX-09 — P3 Low — PERFORMANCE ISSUE — `DurationBadge` SLA memicu re-render setiap tick global untuk setiap row yang punya SLA

**Status:** Confirmed
**Location:** FE `ConversationCard.tsx` `DurationBadge` × `useGlobalTicker`
**Scenario:** list dengan banyak conversation ber-SLA aktif terlihat sekaligus.
**Expected:** ticking SLA murah; hanya elemen teks yang ter-update.
**Actual / Failure Mode:** `DurationBadge` memanggil `useGlobalTicker()` (`ConversationCard.tsx:206`) dan `useMemo` yang sengaja bergantung pada `tickCount` (`:209-216`, dengan `eslint-disable react-hooks/exhaustive-deps`). Setiap tick men-render ulang **setiap** `DurationBadge` yang ter-mount. Karena `DurationBadge` dipanggil dari `TopRow` (`:170-176`) yang bukan komponen ter-memo terpisah per badge, biaya render menyebar. Ini design yang lazim (ticker terpusat lebih baik daripada N interval), jadi bukan defect — tapi tidak ada guard "stop ticking untuk SLA yang sudah lewat/closed", sehingga conversation closed dengan `sla` masih ikut tick.
**Root Cause:** tidak ada kondisi berhenti pada ticking; `elapsed` dihitung dari `createdAt` tanpa batas atas.
**Evidence:**
- `ConversationCard.tsx:206-216` — `useGlobalTicker()` + memo bergantung `tickCount`
- `ConversationCard.tsx:170-176` — `DurationBadge` dirender bila `chat.sla` truthy, **tanpa** memeriksa `chat.status`
- `ConversationCard.tsx:212-214` — `Date.now() - new Date(createdAt).getTime()`, unbounded
**Impact:** scripting time tambahan pada list panjang; angka SLA terus berjalan untuk conversation yang sudah closed (juga salah secara semantik).
**Blast Radius:** semua user pada view yang menampilkan conversation closed dengan field `sla`.
**Recommendation:** jangan render `DurationBadge` bila `chat.status !== 'open'` (atau bila SLA sudah terpenuhi); pertimbangkan memo per-badge.
**Suggested Test:** render conversation `status='closed'` dengan `sla` terisi; assert badge SLA tidak dirender dan tidak ada re-render pada tick.

### CLX-10 — P4 Info — Aspek 1 — hal yang **clean**

- Timestamp: `formatToDynamicDateTime(chat.timestamp)` (`ConversationCard.tsx:181`) memakai `useDynamicDateFormatter` yang default-nya `Intl.DateTimeFormat().resolvedOptions().timeZone` dan mem-format via `toZonedTime` + locale map (`packages/helpers/src/format-date-time.ts:104-128`). Pada jalur list (tanpa tz eksplisit) `isToday`/`isYesterday` dievaluasi terhadap zona lokal yang sama → **konsisten**. Risiko drift hanya muncul bila caller mengirim `timeZone` eksplisit yang berbeda dari zona sistem; conversation list tidak melakukannya. Clean untuk scope ini.
- Truncation preview: `line-clamp-1 truncate flex-1` + `min-w-0` pada kontainer (`LatestMessage.tsx:26`, `ConversationCard.tsx:62`) — benar, tidak overflow.
- Pinned indicator, starred icon, ticket badge, phone badge: masing-masing punya guard truthy dan `data-cy` (`ConversationCard.tsx:456-462`, `:164-169`, `:565-569`, `:509-513`) — clean.
- `ChatCard` di-`React.memo` (`ConversationCard.tsx:597`) dan `ChatCardCheckboxOrAvatar` di-`memo` (`ChatCardCheckboxOrAvatar.tsx:38`) — clean (efektivitasnya dibatasi CLX-04/CLX-31).
- XSS: tidak ada `dangerouslySetInnerHTML` pada jalur render item conversation-list — clean (detail di Aspek 9).

---

### Aspek 2 — Bulk action / multi-select

### CLX-11 — P2 Medium — DATA INTEGRITY ISSUE — Select-All bersifat *sticky*: item baru dari socket refetch otomatis ikut terseleksi

**Status:** Confirmed  
**Location:** FE `conversationBulkAction.store.ts` `syncSelection` × `ConversationChatListBulkAction.tsx:657-660`  
**Scenario:** (a) agent **Select All** (`selectAll(allIds)`), flag `isSelectAllActive = true`. (b) socket event memicu refetch `useConversations`; `allIds` berubah (2 item baru masuk). (c) `useEffect([allIds, syncSelection])` memanggil `syncSelection(allIds)`.  
**Expected:** 2 item baru **tidak** otomatis terseleksi (Select-All = snapshot saat diklik), atau behavior didokumentasikan.  
**Actual / Failure Mode:** `syncSelection` branch `isSelectAllActive ? dedupe(availableIds)` (`conversationBulkAction.store.ts:67-68`) → seluruh `allIds` terbaru jadi `selectedIds`, termasuk 2 item baru. Verified: `ConversationChatListBulkAction.tsx:658-660` `useEffect(() => { syncSelection(allIds) }, [allIds, syncSelection])`, `allIds` dari `useConversationData()` (`:500-508`, flatMap semua page).  
**Root Cause:** `isSelectAllActive` bertahan sampai user toggle satu item (reset ke false, store `:40/:54/:77`) atau `clearSelection`. Refetch tidak reset flag; tidak ada snapshot ID saat select-all.  
**Evidence:**  
- `conversationBulkAction.store.ts:65-72` — `syncSelection`, branch `isSelectAllActive ? dedupe(availableIds)`  
- `conversationBulkAction.store.ts:57-63` — `selectAll` set `isSelectAllActive: true`  
- `ConversationChatListBulkAction.tsx:657-660` — `useEffect(() => { syncSelection(allIds) }, [allIds, syncSelection])` (CONFIRMED exact line pass ini)  
- `ConversationChatListBulkAction.tsx:500-508` — `useConversationData` menghasilkan `allIds` dari flatMap semua page  
**Impact:** setelah Select-All + bulk destructive (junk/close/spam), item yang masuk via socket sebelum submit ikut terkena — user tidak melihatnya masuk. Data-integrity risk, tapi butuh timing window (select-all → socket-insert → belum toggle → submit) sehingga P2, bukan P1.  
**Blast Radius:** user bulk-action pada inbox aktif dengan traffic realtime.  
**Recommendation:** (A) reset `isSelectAllActive=false` saat `allIds` berubah (di `useEffect` sebelum `syncSelection`), sehingga branch `filter` (`:69`) hanya pertahankan ID lama; atau (B) simpan snapshot `Set` saat select-all, `syncSelection` pertahankan intersection. Opsi A = 1 baris. Bila sticky memang intended, dokumentasikan + tambah visual \"+2 baru\" agar user sadar.  
**Suggested Test:** Select All 100 item, socket menambah 2 item, assert `selectedIds.length` = 100 dan 2 item baru tidak included (opsi A).

### CLX-12 — P2 Medium — OPERABILITY ISSUE — Bulk close/star/pin/spam/junk/markRead tidak mendeteksi partial failure (`modifiedCount < selected`); hanya assign & reopen yang benar

**Status:** Confirmed  
**Location:** FE `ConversationChatListBulkAction.tsx` action success handlers  
**Scenario:** bulk close 10 conversation, BE hanya close 7 (3 sudah closed / conflict). `modifiedCount = 7`.  
**Expected:** toast informatif \"7/10 berhasil, 3 dilewati\" seperti pola assign, + selection hanya di-clear untuk yang berhasil.  
**Actual / Failure Mode:** handler close/star/pin/spam/markRead/junk memanggil `clearSelection()` lalu `showSuccessToast(tToast('...success', { count: modifiedCount }))` **tanpa** membandingkan `modifiedCount` dengan `selectedIds.length`. Jadi 7/10 tampil sebagai \"7 berhasil\" (angka benar) tapi **tanpa** menyatakan 3 gagal — user mengira semua beres, dan selection sudah ke-clear (tidak bisa retry 3 sisa). Kontras: `useAssignHandler` (`:479-497`) **sudah benar** — hitung `skippedCount = payload.ids.length - modifiedCount` dan pakai `assign.successWithSkipped`; `createReopenSuccessHandler` (`:422-439`) juga benar — warning bila `modifiedCount === 0`. Jadi pola yang benar SUDAH ada di file, hanya tidak dipakai konsisten. Tidak ada `onError` sama sekali → hard failure (network/500) silent (mutation reject tanpa toast).  
**Root Cause:** partial-failure handling di-implement per-action ad-hoc; hanya assign+reopen yang lengkap. Tidak ada helper bersama + tidak ada `onError`.  
**Evidence:**  
- `ConversationChatListBulkAction.tsx:144-151` (markRead), `:176-181` (star), `:206-211` (pin), `:232-239` (spam), `:268-274` (unjunk), `:623-631` (junk) — semua `clearSelection()` + success toast tanpa compare `modifiedCount` vs `selectedIds.length`, tanpa `onError`  
- `ConversationChatListBulkAction.tsx:479-497` (`useAssignHandler`) — CONTOH BENAR: `skippedCount` + `successWithSkipped`  
- `ConversationChatListBulkAction.tsx:422-439` (`createReopenSuccessHandler`) — CONTOH BENAR: warning bila 0  
**Impact:** user tidak tahu sebagian bulk gagal; tidak bisa retry tertarget; hard error diam.  
**Blast Radius:** semua bulk action selain assign/reopen.  
**Recommendation:** ekstrak satu helper `bulkSuccessHandler(actionKey, selectedIds, clearSelection, tToast)` yang meniru pola assign (compare count → `successWithSkipped` bila ada skip) + tambah `onError` generic (toast error + jangan clearSelection). Terapkan ke 6 action.  
**Suggested Test:** mock bulk-close return `modifiedCount=7` untuk 10 IDs; assert toast menyebut skip/partial dan behavior selection sesuai keputusan (retain-failed vs clear).

---

### Aspek 3 — Filter / advance-filter

**CLX-13 — P3 Low — INCONSISTENCY — Advanced filter store sengaja memakai `persist` kosong (`partialize: () => ({})`) sehingga agent/tag selalu hilang saat refresh; kontras dengan `conversationFilter.store.ts` yang persist `sort`**

**Status:** Confirmed  
**Location:** FE `conversationAdvancedFilter.store.ts` + `conversationFilter.store.ts`  
**Scenario:** agent pilih 3 agent + 2 tag dari advanced-filter popover, apply, reload page.  
**Expected:** policy persistence konsisten lintas filter (semua persist, atau semua volatile dengan alasan yang jelas).  
**Actual / Failure Mode:** `conversationAdvancedFilter.store` memang **memakai** `persist`, tetapi `partialize: () => ({})` (`conversationAdvancedFilter.store.ts:86-91`) sengaja tidak menyimpan nilai apapun, sehingga `selectedAgents`/`selectedTags` selalu reset saat reload. Sebaliknya `conversationFilter.store` menyimpan `sort` (`conversationFilter.store.ts:45-48`). Hasil UX tetap sama seperti temuan awal: sort bertahan, advanced-filter hilang, tetapi mekanisme aslinya bukan "tanpa persist" melainkan "persist no-op".  
**Root Cause:** tidak ada policy tunggal; dua store memakai strategi persist berbeda tanpa penjelasan user-facing.  
**Evidence:**  
- `conversationAdvancedFilter.store.ts:46-47` — dibungkus `persist(`  
- `conversationAdvancedFilter.store.ts:86-91` — `partialize: () => ({})` + komentar `Don't persist filter values - reset on page reload`  
- `conversationFilter.store.ts:33-49` — `persist(..., { partialize: (state) => ({ sort: state.sort }) })`  
**Impact:** pengalaman tidak konsisten; agent re-setup filter tiap reload.  
**Blast Radius:** user yang mengandalkan agent/tag filter lanjutan.  
**Recommendation:** samakan policy: (A) persist nilai advanced filter juga, atau (B) reset semua saat reload dan hapus persist `sort` + dokumentasikan "filter bersifat session-only".  
**Suggested Test:** apply advanced-filter (pilih 2 agent), reload, assert behavior sesuai policy yang dipilih dan konsisten dengan sort filter.

---

### Aspek 4 — Modals

**CLX-14 — P4 Info — Aspek 4 — Modal assign validation: BENAR (retraksi klaim awal)**

**Status:** Analyzed, clean  
**Location:** FE `modals/AssignConversationModal.tsx`, `BulkAssignConversationModal.tsx`, `AssignModalFooter.tsx`  
**Klaim awal (retracted):** "modal assign tidak validasi required field". **Salah** — verified pass ini:  
- `AssignConversationModal` `validateForm` (`:253-261`): member → `selectedMembers.length > 0`, team → `!!selectedTeam?.id` (dan false bila team sudah disabled).  
- `BulkAssignConversationModal` `validateForm` (`:180-185`): sama + guard `selectedIds.length === 0 → false`.  
- `handleSubmit` (`:284-287` / `:208-211`): `if (!validateForm()) return` — tidak submit bila invalid.  
- `AssignModalFooter` (`:33`): `<Button disabled={!isFormValid || isLoading}>` — tombol Confirm mati saat form invalid, `isLoading` mencegah double-submit.  
- `LabelRequired` (`:90/:151`) menandai field wajib secara visual.  
**Kesimpulan:** trust-boundary FE untuk assign SUDAH benar (validasi + disabled + double-submit guard). Modal junk (`JunkReasonModal`) belum diperiksa detail pass ini — apakah `reason` required sebelum confirm masih **NEEDS-VALIDATION** (satu-satunya sisa di aspek 4).  
**Recommendation:** None untuk assign. Verifikasi `JunkReasonModal` reason-required sebagai follow-up kecil.  
**Suggested Test:** (regression) buka assign modal tanpa pilih apa-apa → Confirm disabled (sudah expected-pass).

---

### Aspek 5 — Accessibility

**CLX-15 — P1 High — A11Y DEFECT — Virtualized list row tidak memakai semantic `role=\"listitem\"` dan parent tidak `role=\"list\"` → screen reader tidak announce jumlah item / posisi**

**Status:** Confirmed  
**Location:** FE `InfiniteVirtualContainer.tsx` + `ConversationChatLists.tsx`  
**Scenario:** screen-reader user membuka conversation list.  
**Expected:** announce \"List, 42 items\" saat masuk container, \"item 1 of 42\" per row.  
**Actual / Failure Mode:** container `<div ref={parentRef} style={{...}}` (`InfiniteVirtualContainer.tsx:225`) tanpa `role=\"list\"`. Row wrapper `<div key={...} style={{...}}` (`:264-283`) tanpa `role=\"listitem\"`. Konten row (`ChatCard`) punya `data-cy` tetapi tidak `role`. SR membaca hanya teks flat tanpa struktur list.  
**Root Cause:** shared virtualized container tidak inject semantic role (mungkin by design agar konsumen fleksibel), tetapi conversation-list tidak menambahkan wrapper semantic.  
**Evidence:**  
- `InfiniteVirtualContainer.tsx:225-290` — container + rows, tidak ada `role`  
- `ConversationCard.tsx` — `<Card>` component yang render `<div>` (`packages/ui/src/components/atoms/card` perlu cek apakah support `role` prop).  
**Impact:** SR user tidak dapat navigate by-item (jump ke item berikutnya), tidak tahu posisi dalam list, tidak tahu panjang list.  
**Blast Radius:** semua pengguna SR.  
**Recommendation:** tambahkan `role=\"list\"` pada `parentRef` container dan `role=\"listitem\"` pada row wrapper. Tambahkan `aria-setsize={count}` + `aria-posinset={virtualData.index+1}` per row bila virtualizer tidak otomatis (kebanyakan tidak). Alternatif: bungkus render card dengan `<li>` dan container dengan `<ul>` (ubah tag, bukan role), tetapi styling perlu disesuaikan.  
**Suggested Test:** SR automation (axe-core atau manual VoiceOver/NVDA): assert container dikenali sebagai list dengan item-count, row pertama announce \"1 of N\".

**CLX-16 — P4 Info — Aspek 5 — Checkbox select conversation SUDAH punya label aksesibel (retraksi klaim awal)**

**Status:** Analyzed, clean  
**Location:** FE `ChatCardCheckboxOrAvatar.tsx`  
**Klaim awal (retracted):** "checkbox select conversation tidak punya label teks". **Salah** — verified: checkbox dibungkus `<label htmlFor={checkboxId} aria-label={`Select conversation with ${name}`}>` (`ChatCardCheckboxOrAvatar.tsx:55-59`) dan `<Checkbox id={checkboxId} ... />` (`:61-68`). Jadi SR tetap mendapat konteks conversation lewat label wrapper.  
**Catatan:** label masih hardcoded English (`Select conversation with ...`) sehingga isu i18n tetap ada dan sudah tercakup di **CLX-18**.  
**Recommendation:** tidak perlu fix a11y-label; cukup pindahkan string ini ke i18n catalog bersama aksesibilitas string lain.  
**Suggested Test:** SR assert checkbox announce mencantumkan nama contact (expected-pass).

**CLX-17 — P3 Low — A11Y / UX GAP — Row sudah bisa difokuskan + Enter/Space membuka conversation, tetapi belum ada roving ArrowUp/ArrowDown untuk list traversal cepat**

**Status:** Confirmed  
**Location:** FE `ConversationCard.tsx` + `useChatHandlers.ts` + `InfiniteVirtualContainer.tsx`  
**Scenario:** keyboard-only user ingin membuka conversation ketiga dari list.  
**Expected:** minimal row bisa difokuskan dan `Enter` membuka conversation; idealnya `ArrowDown`/`ArrowUp` memindahkan fokus antar row seperti inbox/list modern.  
**Actual / Failure Mode:** dasar keyboard accessibility **sudah ada**: row `<Card>` punya `tabIndex={0}` (`ConversationCard.tsx:534`) dan `onKeyDown={handleKeyDown}` (`:538`), sementara `handleKeyDown` membuka conversation pada `Enter`/`Space` (`useChatHandlers.ts:16-20`). Jadi klaim awal "tidak bisa buka conversation via keyboard" **salah**. Gap yang masih nyata: tidak ada handler roving `ArrowDown`/`ArrowUp` di container/row untuk pindah antar item secara efisien; user tetap harus `Tab` satu per satu melewati banyak fokusable sub-element (checkbox, quick-action, dst.) bila ingin melompat beberapa row.  
**Root Cause:** implementasi hanya memenuhi keyboard activation per-row, belum keyboard traversal pattern untuk list virtualized.  
**Evidence:**  
- `ConversationCard.tsx:533-538` — `<Card tabIndex={0} ... onKeyDown={handleKeyDown}>`  
- `useChatHandlers.ts:16-20` — `Enter` / `Space` memanggil `handleClick()`  
- `InfiniteVirtualContainer.tsx:218-280` — tidak ada roving-focus / arrow-key navigation pada wrapper list  
**Impact:** keyboard user masih bisa memakai list, tetapi lambat pada inbox panjang. Ini gap efisiensi/usability, bukan broken accessibility total.  
**Blast Radius:** keyboard-only user dan power-user yang mengandalkan keyboard.  
**Recommendation:** jika UX keyboard menjadi prioritas, tambahkan roving tabindex / arrow-key navigation di wrapper list. Jika tidak, turunkan prioritas — baseline keyboard activation sudah lolos.  
**Suggested Test:** fokus row pertama, tekan `Enter` → conversation terbuka (expected-pass). Lalu bila fitur arrow-nav ditambah, assert `ArrowDown` memindahkan fokus ke row berikutnya.

---

### Aspek 6 — i18n

**CLX-18 — P3 Low — I18N DEFECT — 4+ hardcoded English strings di `BulkAction` / `PullButton` untuk `aria-label` / internal const tidak di-i18nkan**

**Status:** Confirmed  
**Location:** FE `bulk-action/*.tsx`, `PullButton.tsx`  
**Scenario:** deployment non-English (Indonesia).  
**Expected:** semua user-facing strings (termasuk SR announce) dalam bahasa lokal.  
**Actual / Failure Mode:** grep hasil menunjukkan `aria-label` hardcoded di beberapa tempat:  
- `BulkActionsMenu.tsx:6-7` — `const OPEN_BULK_ACTION_MENU = 'Open bulk actions menu'`, `const BULK_ACTION = 'Bulk actions'` (dipakai sebagai `aria-label`).  
- `PullButton.tsx:59,71,81,279` — `aria-label={UI.ARIA.DECREMENT/COUNT_INPUT/INCREMENT/PULL_ACTION}` (konstanta `UI.ARIA` perlu cek apakah dari i18n atau hardcoded).  
- `ConversationCard.tsx:464` — `aria-label=\"mentioned\"` (string literal).  
String ini hanya didengar SR, tapi tetap non-compliant jika produk multi-bahasa.  
**Root Cause:** sebagian accessibility string tidak masuk message catalog; mungkin dianggap \"developer-facing\" padahal SR user-facing.  
**Evidence:**  
- `BulkActionsMenu.tsx:6-7`  
- `PullButton.tsx` (perlu cek definisi `UI.ARIA` — bila dari `@/constants`, likely hardcoded)  
- `ConversationCard.tsx:464`  
**Impact:** SR user non-English mendengar mixed-language announce.  
**Blast Radius:** SR user pada deployment i18n-enabled.  
**Recommendation:** ganti hardcoded string dengan `useTranslations('aria')` keys; tambahkan key `aria.openBulkActionMenu`, `aria.mentioned`, dst. Audit file accessibility-strings lain (empty-state, error) juga.  
**Suggested Test:** set locale `id` (Indonesia), SR assert announce \"Buka menu aksi massal\" (translated), bukan \"Open bulk actions menu\".

---

### Aspek 7 — Realtime (beyond CL-01/CL-04)

**CLX-19 — P2 NEEDS-VALIDATION — DATA INTEGRITY / PERF — dugaan refetch storm dari socket-invalidation; sebagian handler yang terbaca justru sudah terguard**

**Status:** NEEDS-VALIDATION (hanya sebagian `use-invalidate-conversation.ts` terbaca pass ini)  
**Location:** FE `use-invalidate-conversation.ts` socket handlers  
**Scenario:** 50 agent online, 200 conversation active; setiap incoming message broadcast socket event ke banyak agent.  
**Expected:** invalidate hanya cache relevan, tidak refetch list penuh per event.  
**Actual / Failure Mode:** handler yang terbaca (`use-invalidate-conversation.ts:130+`) **sudah terguard** — hanya invalidate saat `!isConversationExist && (isParticipant || role ADMIN)`, jadi tidak unconditional. Namun registry socket penuh (semua event → invalidate mapping) belum dibaca seluruhnya pass ini; potensi storm hanya terkonfirmasi bila ada event lain yang invalidate root list key tanpa guard. Klaim "storm unconditional" **belum terbukti** → jangan ticketkan sebelum trace penuh.  
**Root Cause (dugaan):** granularitas invalidation mungkin belum optimal untuk beberapa event; perlu verifikasi apakah ada handler yang invalidate `[CONVERSATION_QUERY_KEY]` root (mengenai semua filter variant).  
**Evidence:**  
- `use-invalidate-conversation.ts:130+` — handler terbaca: guard `!isConversationExist && (participant||ADMIN)` sebelum invalidate  
- Registry event→handler penuh: **belum dibaca** (butuh `use-conversation-socket-event.ts` + seluruh `use-invalidate-conversation.ts`)  
**Impact (bila terbukti):** backend load tinggi, FE render churn pada tenant traffic tinggi.  
**Blast Radius:** semua agent pada tenant traffic tinggi (bila ada handler tak terguard).  
**Recommendation:** trace SELURUH mapping socket-event → invalidate; untuk event yang tak terhindarkan invalidate list, pertimbangkan optimistic cache update (update unread counter tanpa refetch penuh). Jangan ambil aksi sebelum trace lengkap.  
**Suggested Test:** mock 200 socket `new.message` (conversation berbeda) dalam 5 detik; assert GET `/conversations?...` ≤ 2× (bukan 200×) — jalankan setelah trace mengonfirmasi handler mana yang perlu difix.

---

### Aspek 8 — Performance (beyond CLX-09)

**CLX-20 — P3 Low — UX ISSUE — `RefreshNotification` tidak punya auto-hide: banner "ada update, klik refresh" tampil sampai user interact/unmount**

**Status:** Confirmed  
**Location:** FE `refreshNotification.store.ts` + `ConversationRefreshNotification.tsx`  
**Scenario:** banner refresh muncul, user ignore (sibuk baca row), banner tetap nongol; message baru lagi 2 menit kemudian → banner tetap sama, user bingung apakah update lama sudah ter-apply.  
**Expected:** banner auto-dismiss setelah durasi tertentu, atau list ter-refresh via jalur lain.  
**Actual / Failure Mode:** `refreshNotification.store.ts:2` `notifTimeout = 30000` **BUKAN** durasi auto-hide — perannya adalah *debounce sejak dismiss*: `showNotification` (`:27-35`) hanya menampilkan banner bila `Date.now() - lastDismissTime > 30000` (mencegah banner muncul lagi ≤30s setelah user dismiss). Tidak ada `setTimeout(hideNotification, …)` di manapun. Banner `show` bertahan sampai user klik refresh/dismiss (`ConversationRefreshNotification.tsx:35-50`) atau komponen unmount.  
**Root Cause:** store hanya menyimpan `show: boolean` + debounce-since-dismiss; tidak ada TTL tampil.  
**Evidence:**  
- `refreshNotification.store.ts:2,27-35` — `notifTimeout` dipakai sebagai guard `timeSinceDismiss > notifTimeout` (debounce), bukan auto-hide  
- `refreshNotification.store.ts:16-37` — hanya `showNotification`/`hideNotification`/`dismissNotification`, tidak ada timer auto-hide  
- `ConversationRefreshNotification.tsx:26,35-50` — `if (!show) return null`; dismiss/refresh manual, tanpa auto-hide  
**Impact:** banner lama nongol; user tidak yakin state list.  
**Blast Radius:** semua user pada inbox realtime.  
**Recommendation:** tambahkan auto-hide: `useEffect` di komponen yang `setTimeout(onDismiss, 60000)` saat `show` jadi true (clear on unmount/interact), atau field TTL di store. Semantik: banner = call-to-action sementara, bukan status permanen.  
**Suggested Test:** trigger notification, jangan klik apapun, tunggu > TTL, assert banner auto-dismiss.

---

### Aspek 9 — Security / data integrity

**CLX-21 — P3 Low — SECURITY / RBAC — Bulk-action button RBAC gating tidak eksplisit terlihat di `ConversationChatListBulkAction` — perlu konfirmasi apakah setiap action di-gate di mutation hook atau BE endpoint**

**Status:** NEEDS-VALIDATION  
**Location:** FE `ConversationChatListBulkAction.tsx` + BE `conversation.controller.ts` bulk endpoints  
**Scenario:** role AGENT coba bulk-junk conversation yang bukan miliknya.  
**Expected:** FE hide button / disable, BE reject 403.  
**Actual / Failure Mode:** pass ini belum membaca `:150-701` dari `BulkAction` file yang berisi render button; tidak terlihat guard `role.code === ...` di sample `:125-151`. Prior audit CL-04 mencatat `PullButton` sudah pakai `role.code` (positif). Perlu cek: (1) FE hide bulk-button per role, (2) BE controller decorator `@UseGuards(RoleGuard)` / `@Permissions([...])` pada setiap bulk endpoint. Pass ini tidak membaca BE controller.  
**Root Cause:** visibility unclear (pass terbatas).  
**Evidence:** TBD (see Open Questions).  
**Impact:** bila tidak di-gate, authorization bypass; role rendah eksekusi bulk-close/junk tenant-wide.  
**Blast Radius:** multi-tenant semua role.  
**Recommendation:** (1) FE audit visibility button per role; (2) BE verify `conversation.controller.ts` setiap bulk method punya decorator permission (trace `@Permissions`, `@AllowedRoles`). Prioritas P3 karena likelihood rendah (biasanya BE guard — risk mitigasi).  
**Suggested Test:** login role AGENT, intercept network, manual POST `/api/bulk-close` conversation di luar scope → assert 403.

**CLX-22 — P4 Info — Aspek 9 — XSS / HTML injection via preview: TIDAK TERKONFIRMASI**

**Status:** Analyzed, clean  
**Location:** FE `LatestMessage.tsx` + `ConversationCard.tsx`  
**Scenario:** conversation dengan `latestMessage.content` berisi script tag `<script>alert(1)</script>` (attacker-controlled email subject/body).  
**Expected:** text di-escape, tag tidak di-eksekusi.  
**Actual:** React render `{content}` sebagai text node (`:LatestMessage.tsx:26-28`) — otomatis di-escape. Tidak ada `dangerouslySetInnerHTML`. **Clean untuk XSS**. Yang nyata hanya masalah render quality (tag tampil literal, lihat CLX-06), bukan eksekusi.  
**Evidence:**  
- `LatestMessage.tsx:26-28` — `{content}` text node, `title={content}` attribute (keduanya safe)  
- Tidak ada `dangerouslySetInnerHTML` di `ConversationCard`, `LatestMessage`, `ChatItem` components (grep dilakukan pass analyzer sebelumnya)  
**Impact:** None (clean).  
**Blast Radius:** N/A.  
**Recommendation:** None (keep clean; monitor jika ada perubahan rendering ke `dangerouslySetInnerHTML` di masa depan).

---

### Aspek 10 — Error handling / operability

**CLX-23 — P3 Low — OPERABILITY ISSUE — `InfiniteVirtualContainer` error branch tidak memakai `noDataError`, sehingga caller tidak bisa inject error-state khusus / retry UX; tetapi teks error BUKAN hardcoded `Failed to load data`**

**Status:** Confirmed (memperluas CL-07, dengan koreksi evidence)  
**Location:** FE `InfiniteVirtualContainer.tsx` error branch  
**Scenario:** conversation list query gagal (API 500 / network timeout); `useConversations` mengembalikan `status === 'error'`.  
**Expected:** caller bisa memberi error-state spesifik (message terjemahan, retry button) seperti saat empty-state.  
**Actual / Failure Mode:** container punya helper `HandleError({ text, noDataError })` (`InfiniteVirtualContainer.tsx:67-76`). Pada branch error, container memang mengambil `error?.message || 'Something went wrong...'` (`:208-210`) lalu merender `<HandleError text={errorMessage} />` **tanpa** meneruskan `noDataError`. Akibatnya error branch jatuh ke fallback generik `HandleError`, bukan `noDataError` khusus caller. Jadi inti masalah tetap: error-state tidak bisa dikustom per consumer. Koreksi penting: klaim awal saya bahwa branch ini hardcode string `Failed to load data` itu salah.  
**Root Cause:** `noDataError` dipakai ganda untuk empty-state, tetapi tidak diteruskan ke branch error; API komponen tidak punya prop error-specific semacam `errorElement`.  
**Evidence:**  
- `InfiniteVirtualContainer.tsx:67-76` — `HandleError` memilih `noDataError ?? <div>...{text}</div>`  
- `InfiniteVirtualContainer.tsx:208-210` — error branch: `return <HandleError text={errorMessage} />` (tanpa `noDataError`)  
- `InfiniteVirtualContainer.tsx:213-214` — empty branch: `return <HandleError text="Data not found!" noDataError={noDataError} />`  
- `ConversationChatLists.tsx:194-210` — caller hanya bisa kirim `noDataError`, tidak ada `errorElement`  
**Impact:** error UX generik; retry/action per-caller tidak tersedia kecuali user reload manual. Namun severity turun karena actual error text tetap berasal dari `error.message`, bukan string statis total.  
**Blast Radius:** semua consumer `InfiniteVirtualContainer` yang butuh error-state kustom.  
**Recommendation:** tambahkan prop terpisah `errorElement?: ReactNode` atau teruskan `noDataError` juga ke branch error bila memang ingin satu placeholder untuk both empty+error.  
**Suggested Test:** mock API failure, assert error branch bisa menerima element custom dengan tombol Retry; fallback tetap menampilkan `error.message` bila `errorElement` tidak diberikan.

---

## Open Questions

1. **TypeScript build check**: kenapa `CLS.MESSAGE_MENTION_BADGE` tidak ditangkap type-check (CLX-01)? Cek `next.config`, `skipLibCheck`, CI pipeline.  
2. **Select-all sticky behavior** (CLX-11): apakah intended? Document jika ya, fix jika tidak.  
3. **BE bulk-action response shape**: apakah BE mengembalikan `{ succeeded: string[], failed: {...}[] }` atau hanya scalar `{ modifiedCount }`? (CLX-12)  
4. **Channel FB/Messenger/Telegram**: apakah sudah GA atau beta-only? Severity CLX-05 tergantung jawaban.  
5. **Email `content` quality**: apakah BE pipeline ingest email selalu menghasilkan plain-text di field `content`, atau kadang markup leak? (CLX-06)  
6. **Bulk-action RBAC**: apakah setiap bulk method di BE controller punya decorator permission? (CLX-21 — BE audit required)  
7. **Query client `staleTime`**: apakah ada override default di `makeQueryClientHelper` atau per-query? (CLX-19 impact)

---

## Executive Summary

Conversation-list memiliki 10 aspek yang di-audit multi-layer (item rendering, bulk action, filter, modal, a11y, i18n, realtime, perf, security, error). Pass analyzer (timeout) menulis aspek 1 penuh (10 finding); orchestrator melanjutkan aspek 2-10 (13 finding tambahan). Total **23 finding baru** (CLX-01..23) + 7 KNOWN dari prior audit (CL-01..07).

**Breakdown severity baru** (setelah verifikasi orchestrator + reviewer-trace):  
- **P1 High: 3** — CLX-01 mention badge rusak, CLX-03 virtual array mismatch menghentikan infinite-scroll, CLX-15 semantic list role hilang untuk SR  
- **P2 Medium: 3** — CLX-04 key positional QuickAction bisa pindah target, CLX-11 select-all sticky (turun dari P1), CLX-12 bulk partial-failure silent  
- **P3 Low: 11** — CLX-02 unread overflow, CLX-05 channel fallback, CLX-06 preview HTML, CLX-07 avatar inisial, CLX-08 TagList doc-drift, CLX-09 SLA tick closed, CLX-13 filter persist-policy inconsistent, CLX-17 belum ada arrow-key row traversal, CLX-18 i18n hardcoded aria, CLX-20 refresh banner tanpa auto-hide, CLX-23 error-state customization gap  
- **P2 NEEDS-VALIDATION: 1** — CLX-19 invalidation storm  
- **P3 NEEDS-VALIDATION: 1** — CLX-21 RBAC bulk-action gating  
- **P4 Info / clean: 4** — CLX-10 clean aspek 1, CLX-14 assign validation BENAR, CLX-16 checkbox label BENAR, CLX-22 XSS clean

**Retraksi & koreksi pass-2/pass-3** (audit integrity):  
- **CLX-14** semula P2 "assign modal tak validasi" → **RETRACTED ke P4 clean**.  
- **CLX-16** semula P2 "checkbox tanpa label" → **RETRACTED ke P4 clean**: label wrapper + `htmlFor` sudah ada.  
- **CLX-17** semula P2 "keyboard tidak bisa buka conversation" → **dikoreksi ke P3 gap**: row sudah `tabIndex={0}` dan `Enter`/`Space` berfungsi; yang belum ada hanya ArrowUp/ArrowDown traversal cepat.  
- **CLX-13** dikoreksi: advanced-filter **memakai** `persist`, tetapi `partialize: () => ({})` membuat persist-nya no-op.  
- **CLX-23** dikoreksi: error text berasal dari `error.message` / `'Something went wrong...'`, bukan hardcoded `'Failed to load data'`; isu nyatanya adalah error branch tidak menerima `noDataError`.  
- **CLX-11** turun **P1→P2**; **CLX-12** dipersempit ke 6 action; **CLX-19** diturunkan ke NEEDS-VALIDATION.

**Risiko terbesar** (setelah koreksi):  
1. **CLX-03** virtual array mismatch → infinite-scroll mati saat unread-filter → block triage.  
2. **CLX-04** QuickAction target-swap → data-integrity, aksi destruktif bisa salah objek.  
3. **CLX-15** semantic list role hilang → SR kehilangan struktur list/posisi item.  
4. **CLX-11** select-all sticky → bulk destructive bisa kena item tak dimaksud (timing-dependent).

**Hal yang sudah benar** (tidak perlu diperbaiki):  
- Virtualized container performance baseline clean (sebelum bug CLX-03/04)  
- Timezone timestamp konsisten (CLX-10)  
- XSS escape benar (CLX-22)  
- Assign/BulkAssign modal validation + double-submit guard benar (CLX-14)  
- Checkbox bulk-select sudah berlabel aksesibel; tinggal i18n-kan string-nya (CLX-16 clean, CLX-18 open)  
- Row keyboard activation (`tabIndex`, `Enter`, `Space`) sudah berfungsi; gap tinggal arrow traversal (CLX-17)  
- Bulk assign & reopen partial-failure handling benar (kontras dgn 6 action lain, CLX-12)  
- `syncSelection` untuk kasus non-select-all benar (hanya branch select-all sticky yang jadi isu, CLX-11)  
- RBAC visibility `PullButton` pakai `role.code` (positif; extend ke bulk-button = CLX-21)

**Coverage note**: audit ini **detail pada 10 aspek** yang diminta user; **TIDAK mencakup** (out-of-scope atau sudah tercakup audit lain):  
- Message thread / chat room (bukan list)  
- Conversation detail page (hanya list panel)  
- BE repository query optimization (sudah di Track E prior audit)  
- BE authorization controller decorator (mentioned CLX-21 Open Q, perlu audit BE terpisah)

---

## System Model

### Actors
- Agent (role AGENT)  
- Supervisor (role SUPERVISOR)  
- Admin (role ADMIN)  
- Non-admin role lain (dapat view conversation list sesuai scope RBAC)

### Components FE
- `ConversationChatLists.tsx` — shell list + infinite-container integration  
- `ConversationCard.tsx` — item row render (730 LOC: timestamp, badge, indicator, avatar, preview, SLA, quick-action)  
- `chat-item/` — Avatar, Checkbox, TagList, QuickAction, CreatedTicket sub-komponen  
- `ConversationChatListBulkAction.tsx` — bulk toolbar + modal triggers (701 LOC)  
- `bulk-action/` — BulkActionButtons, BulkActionHeader, BulkActionsMenu  
- `filters/` — AdvanceFilterModal, FilterPopover, advance-filter/* (agent/tag popover search)  
- `modals/` — AssignConversationModal, BulkAssignConversationModal, JunkReasonModal, ValidationBulkConversationModal  
- `ConversationChatListFilter.tsx` — filter chips (status/read toggle)  
- `ConversationChatListHeader.tsx` — search bar + filter trigger  
- `ConversationRefreshNotification.tsx` — banner \"ada update, klik refresh\"  
- `PullButton.tsx` — pull-conversation widget (AGENT role)  
- Stores: `conversationFilter.store.ts` (persist sort only), `conversationAdvancedFilter.store.ts` (agent/tag, volatile), `conversationBulkAction.store.ts` (selection + syncSelection logic)  
- Hooks: `use-invalidate-conversation.ts` (socket → cache invalidation), `use-conversation-socket-event.ts` (socket event registry), `useConversationFilters.ts` (build filter object), `useChatHandlers.ts` (row click/hover), `conversation.service.ts` (useConversations infinite-query + bulk mutation hooks)  
- Shared: `InfiniteVirtualContainer.tsx` (`packages/ui`, konsumen multi-modul)

### Components BE
- `apps/conversation-service/src/app/repositories/conversation.repository.ts` — `getPaginatedConversation` (filter, sort, search pipeline + $skip/$limit)  
- `apps/conversation-service/src/app/services/conversation.service.ts` — `getConversations`, `assignConversation`, `bulkClose`, `bulkJunk`, `shouldScopeByTeam`, `buildAssignFilter`  
- `apps/conversation-service/src/app/controllers/conversation.controller.ts` — HTTP endpoints `/conversations`, `/bulk-*`, RBAC decorator (perlu verify CLX-21)

### Main flow (simplified)
1. User membuka route conversation-list → `ConversationChatLists` mount  
2. Build `filters` via `useConversationFilters()` (merge nav state + filter store + advanced-filter store)  
3. Call `useConversations(filters)` → infinite-query hit `GET /api/conversations?page=1&status=...&hideEmpty=true`  
4. BE `getConversations` → `conversationRepository.getPaginatedConversation` → filter+sort+lookup latestMessage → pagination  
5. FE receive pages → `formatData` (re-filter unread LOCAL + re-sort LOCAL, masalah CL-01/CLX-03) → `InfiniteVirtualContainer` render rows virtualized  
6. Socket event (`notification.new.message` dll) → `use-conversation-socket-event` → selective `invalidateQueries` (masalah CLX-19) atau optimistic update (CLX-04 key positional risk)  
7. User select row → checkbox toggle → `conversationBulkAction.store` track IDs → BulkAction toolbar visible → user pilih action → mutation hook → BE bulk endpoint → `onSuccess` toast + `clearSelection` (masalah CLX-11/12)

---

## Recommendation / Next Action

**Decision:** `PROCEED_WITH_CAUTION`

**Blocking issues** (harus diperbaiki sebelum release apapun yang menyentuh list):  
1. **CLX-03** — fix virtual array length mismatch (gunakan `processedRows.length` konsisten, atau hapus re-filter FE dan pindah ke BE param; 2 hari, fungsional block)  
2. **CLX-04** — ganti key row ke ID-based, tutup popover saat `chat.id` berubah (1 hari, data-integrity)  
3. **CLX-15** — tambah `role="list"`/`"listitem"` untuk SR (4 jam, a11y high)

**High-priority non-blocking** (dapat masuk backlog sprint berikutnya):  
4. **CLX-01** — tambah `MESSAGE_MENTION_BADGE` ke CLS + audit type-check CI (2 jam)  
5. **CLX-11** — reset `isSelectAllActive` saat refetch atau simpan snapshot (4 jam)  
6. **CLX-12** — detect partial bulk-failure + retry UX (1 hari, perlu BE enhancement jika response shape kurang)  
7. **CLX-17 / CLX-18 / CLX-20 / CLX-23** — keyboard traversal cepat, i18n accessibility strings, banner auto-hide, error-state customization (backlog UX hardening)

**Medium/low backlog**:  
8. Sisanya (CLX-02/05/06/07/08/09/13/14/16/19/21/22/23) — prioritaskan berdasar deployment config dan hasil open-question verification.

**Open-question resolution lane** (analyst + PM meeting):  
9. Jawab 7 Open Questions di atas → adjust severity / add tickets sesuai jawaban.

**Cross-team sync**:  
10. Share CLX-03/04/15/23 ke Tim Ticket/Broadcast/Contact — `InfiniteVirtualContainer` shared component, bug berlaku ke semua konsumen (blast-radius repo-wide)

---

**STATUS:** COMPLETED WITH REVIEWER-TIMEOUT RECOVERY  
**SUMMARY:** Deep 10-aspect audit conversation-list selesai dan sudah dikoreksi dari reviewer-trace timeout. Total 23 finding CLX-01..23: P1 confirmed×3 (CLX-01/03/15), P2 confirmed×3 (CLX-04/11/12), P3 confirmed×11, NEEDS-VALIDATION×2 (CLX-19/21), clean/retracted×4 (CLX-10/14/16/22). Blocking: CLX-03/04/15. Decision `PROCEED_WITH_CAUTION`.  
**FINDINGS:** Confirmed {P1=3, P2=3, P3=11}; Needs-validation {P2=1, P3=1}; Clean/retracted {P4=4}. IDs = CLX-01..23.  
**ASSUMPTIONS:** BE bulk response shape masih perlu verify (CLX-12); FB/Telegram channel mungkin belum GA (CLX-05); default query `staleTime` belum ditrace penuh (CLX-19).  
**RISKS:** CLX-03 infinite-scroll mati saat unread-filter, CLX-04 key positional bisa salah target destructive action, CLX-15 SR kehilangan struktur list, CLX-11 select-all sticky bisa mengenai item tak dimaksud.  
**OUTPUT:** C:/Users/MyBook SAGA 12/Desktop/PRDanalisis/Assessments/audit/detail-conversation/2026-09-07-conversation-list-deep-audit.md  
**FOLLOW-UP TASKS:** (1) Wire report ke `Assessments/audit/README.md` + `02-reading-list-and-conflicts.md`; (2) Resolve 7 Open Questions; (3) Ticket/fix blocking CLX-03/04/15; (4) Audit BE controller untuk CLX-21.

[iter 1] analyzer → timeout setelah aspect-1 (10 finding). [iter 2] orchestrator → selesaikan aspect 2-10 langsung (13 finding) + koreksi reviewer-trace timeout. Total 23 CLX; confirmed high-priority utama: CLX-01/03/04/15.
