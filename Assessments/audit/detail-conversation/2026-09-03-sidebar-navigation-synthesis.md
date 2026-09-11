# Audit Tunggal: Conversation-Sidebar-Navigation

> **Status:** CANONICAL DETAIL / code-verified
> **Version:** v2.0
> **Baseline:** FE/BE memory menjadi patokan utama; branch operasional `prod-2.8.1`
> **Owner:** Dany Christian (PM) / Naftal Yunior (Eng Lead)
> **Changelog v2.0:** menggabungkan audit counter, default channel, team inbox, dan re-verifikasi 2026-09-04; mengoreksi C2/C3/C5; mend deduplikasi empat gap invalidation menjadi satu akar masalah; menyiapkan CSN-01..12 untuk master register.

File ini adalah satu-satunya laporan aktif untuk seluruh scope **Conversation-Sidebar-Navigation**. Isinya menyerap:

- `_source/2026-09-03-counter-divergence.md`
- `_source/2026-09-03-default-channel-display.md`
- `_source/2026-09-03-team-inbox-rules.md`
- `_source/2026-09-04-verify-team-inbox-rules.md`

Keempat source dipindahkan ke `_source/` untuk traceability, bukan untuk dibaca sebagai audit aktif.

---

## 1. Scope dan Verdict

Scope:

1. Sinkronisasi counter sidebar dengan Conversation List.
2. Channel default yang ditampilkan per company.
3. Team Inbox: visibility, role gate, ownership, dan counter scope.

| Area | Verdict | Risiko utama |
|---|---|---|
| Counter vs list | **BROKEN / PARTIAL** | Invalidation counter tidak lengkap; criteria count belum dibuktikan identik dengan list. |
| Default channel | **PARTIAL** | Company scope benar, tetapi lifecycle cache dan active-channel filtering tidak konsisten. |
| Team Inbox | **BROKEN / PARTIAL** | FE membandingkan `role.name` dengan enum code; counter scope non-ADMIN berbeda dari team visibility. |

**Blocking:** CSN-01.
**Perlu validasi/keputusan sebelum ticket final:** CSN-03, CSN-05, CSN-10, CSN-11.

---

## 2. Alur Sistem Ringkas

```text
Sidebar load
  ├─ FE GET /conversation/count
  │    └─ BE resolveTeams + aggregate count + cache per userId
  │         └─ socket conversation.counter memperbarui FE cache
  ├─ FE GET /conversation?...filters
  │    └─ BE repository membangun team/participant filters
  └─ FE render inbox rows + channel rows + team rows

Perubahan realtime
  ├─ sebagian event memutasi list cache langsung
  └─ sebagian event meng-invalidate counter
       tetapi coverage event tidak lengkap
```

Akar lintas-area:

- **Counter invalidation tidak punya satu kontrak lifecycle.** New message pada conversation existing, perubahan status channel, dan perubahan role tidak ditangani konsisten; polling/TTL juga tidak ada.
- **Count dan list dibangun lewat criteria berbeda.** Gejala 26-vs-28 dan scope Team Inbox berasal dari kelas masalah yang sama.
- **Role gate FE tidak konsisten.** Sidebar memakai `role.name`; jalur lain memakai `role.code`.

---

## 3. Rule Inventory Team Inbox

| Rule | Perilaku aktual | Evidence | Status |
|---|---|---|---|
| R1 — Team visibility | `ADMIN` melihat semua team company; non-ADMIN mendapat union membership team + team yang memiliki conversation assigned ke user. FE mengandalkan hasil BE. | BE `conversation.service.ts:1332-1341,5555-5582`; FE `ConversationNavItemDefault.tsx:293-297` | confirmed |
| R2 — Create team | Tombol dimaksudkan untuk `SUPERVISOR`/`ADMIN`, tetapi implementasi membaca `role.name`. | FE `ConversationNavItemDefault.tsx:294-295` | broken; lihat CSN-01/11 |
| R3 — Inbox visibility | AGENT seharusnya tidak melihat `unassigned` dan `all`; role lain melihat semua item. Implementasi membaca `role.name`. | FE `ConversationNavItemDefault.tsx:137-183` | broken; lihat CSN-01 |
| R4 — Counter scope | Hanya AGENT/SUPERVISOR yang diberi team scope; non-ADMIN lain tidak. | BE `conversation.service.ts:6477` | partial; lihat CSN-09 |
| R5 — List ownership | AGENT dipaksa ke `participants.userId=currentUser`; role lain dapat melihat semua conversation dalam team yang dipilih. | BE `conversation.repository.ts:2584,2746-2754,3663-3677` | confirmed |
| R6 — Counter cache | Counter dicari per `userId`; role/scope tidak menjadi bagian lookup key. | BE `counter.repository.ts:90-93` | partial; lihat CSN-02 |

`TeamInboxSection.tsx` adalah ekstraksi presentasional. Gate tetap dihitung di `ConversationNavItemDefault.tsx`; refactor tersebut tidak menutup CSN-01.

---

## 4. Register Temuan Tunggal

### CSN-01 — FE role gate memakai `name`, bukan `code`

- **Severity:** Major — blocking
- **Status:** confirmed
- **Area:** RBAC / navigation visibility
- **Evidence:** FE `ConversationNavItemDefault.tsx:142,294-295`; BE `role.seed.ts:51-67`; pembanding benar di `ConversationChatLists.tsx:134`.
- **Temuan:** `RoleTypeEnum` berisi code (`AGENT`, `SUPERVISOR`), tetapi sidebar membandingkannya dengan `userRole.name`. Seed membuktikan `SALES` memiliki code `AGENT`, dan `SUPERVISOR SALES` memiliki code `SUPERVISOR`.
- **Dampak:** SALES agent salah melihat `Unassigned`/`All`; SUPERVISOR SALES kehilangan tombol create team.
- **Remediation:** ganti kedua check ke `userRole?.code`.
- **Acceptance:** role code AGENT dengan name SALES tidak melihat `Unassigned`/`All`; role code SUPERVISOR dengan name SUPERVISOR SALES melihat create-team sesuai policy.
- **Effort:** S

### CSN-02 — Lifecycle invalidation counter tidak lengkap

- **Severity:** Major
- **Status:** confirmed
- **Area:** Counter / realtime consistency
- **Evidence:** FE `conversation.service.ts:348-366`; `use-invalidate-conversation.ts:163-173`; BE `conversation.service.ts:1300-1302`; `counter.repository.ts:90-93`.
- **Temuan:** counter tidak mempunyai polling/TTL safety net dan invalidation contract tidak mencakup setidaknya: new message pada conversation existing, activate/deactivate channel, dan perubahan role. Cache dapat tetap stale sampai event lain atau hard refresh.
- **Dampak:** angka sidebar, daftar channel, dan scope role dapat berbeda dari list aktual.
- **Remediation:** satu kontrak invalidation counter untuk semua mutation yang mengubah membership/count, ditambah TTL atau polling fallback terukur. Jangan membuat tiga tambalan event terpisah.
- **Acceptance:** tiga skenario di atas memperbarui counter tanpa hard refresh; reconnect/drop satu socket event pulih lewat fallback.
- **Effort:** M

### CSN-03 — Criteria count belum dijamin identik dengan criteria list

- **Severity:** Major
- **Status:** needs-validation
- **Area:** Counter / query parity
- **Evidence:** FE list memanggil `getConversations({ assign:true, hideEmpty:true })`; count memanggil `countConversation()` tanpa filter eksplisit.
- **Temuan:** jalur request berbeda; audit belum membuktikan hasil backend selalu memakai visibility, assignment, empty-conversation, team, dan channel criteria yang sama.
- **Dampak:** divergence permanen tetap mungkin meski realtime invalidation diperbaiki.
- **Validation:** bandingkan pipeline final count vs list untuk role/filter matrix dan dataset yang sama.
- **Remediation:** ekstrak/shared criteria di BE atau contract-test parity count/list.
- **Acceptance:** untuk setiap role dan active filter, count sama dengan total dataset list yang visible.
- **Effort:** M

### CSN-04 — Socket counter guard gagal diam-diam saat `userId` tidak cocok

- **Severity:** Low
- **Status:** confirmed
- **Area:** Counter / observability
- **Evidence:** FE `use-conversation-socket-event.ts:570-589`.
- **Temuan:** event hanya diproses bila `currentUserId === data.userId`; mismatch/null dilewati tanpa telemetry atau recovery.
- **Dampak:** counter stale sulit didiagnosis.
- **Remediation:** normalisasi ID, log terstruktur tanpa PII pada mismatch, lalu invalidasi/refetch aman.
- **Acceptance:** payload ID invalid tidak mengubah user lain dan memicu recovery terukur untuk user aktif.
- **Effort:** S

### CSN-05 — Active-channel merge membutuhkan keputusan untuk bucket sintetis

- **Severity:** Medium
- **Status:** needs-decision
- **Area:** Channel navigation
- **Evidence:** BE `conversation.service.ts:1260-1281`; `conversation.repository.ts:2054-2074`.
- **Temuan:** map di-seed dari active channel, lalu hasil agregasi di-`set` tanpa membership guard. Guard `has()` akan membuang bucket yang tidak ada di seed, termasuk kemungkinan `WHATSAPP_WEB_GROUP`/`INSTAGRAM_COMMENT` hasil transformasi.
- **Dampak:** tanpa guard, channel/bucket non-active bisa muncul; dengan guard buta, bucket turunan yang valid bisa hilang.
- **Decision:** PM+Tech mengunci apakah bucket grup/comment mengikuti active parent channel atau berdiri sendiri.
- **Remediation:** setelah policy dikunci, merge hanya key yang diizinkan oleh active parent/channel capability map.
- **Acceptance:** inactive parent tidak tampil; bucket turunan active tampil sesuai matrix yang disetujui.
- **Effort:** S-M

### CSN-06 — Active channel dibatasi 25 item sebelum filtering

- **Severity:** Medium
- **Status:** confirmed
- **Area:** Channel navigation
- **Evidence:** BE `conversation.service.ts:2857,2861-2865,2873`.
- **Temuan:** `getChannels` mengambil `limit:25`, baru kemudian memfilter `ACTIVE`. Active channel di luar page pertama dapat hilang.
- **Dampak:** false negative pada company dengan lebih dari 25 channel atau campuran status besar.
- **Remediation:** filter `ACTIVE` server-side dan paginate sampai selesai; jangan menaikkan angka hardcoded tanpa kontrak.
- **Acceptance:** seluruh active channel company tampil meski total channel >25.
- **Effort:** S-M

### CSN-07 — Platform count memakai whitelist hardcoded

- **Severity:** Medium
- **Status:** confirmed
- **Area:** Channel navigation
- **Evidence:** BE `conversation.repository.ts:1969-1988`.
- **Temuan:** platform `$in` tidak diturunkan dari active/configured channels company.
- **Dampak:** platform valid di luar whitelist hilang dari counter/sidebar.
- **Remediation:** derive platform set dari active channel/capability company.
- **Acceptance:** channel aktif baru tidak membutuhkan edit whitelist repository untuk muncul.
- **Effort:** M

### CSN-08 — Aggregasi channel menghitung history channel non-active

- **Severity:** Low
- **Status:** confirmed
- **Area:** Channel counter
- **Evidence:** BE `conversation.repository.ts:1956`.
- **Temuan:** pipeline count tidak join/filter status channel.
- **Dampak:** data non-active tetap dihitung dan dapat bocor ke display melalui merge/cache gap lain.
- **Remediation:** filter menggunakan active channel IDs bila kontrak counter hanya mencakup channel aktif.
- **Acceptance:** menonaktifkan channel mengeluarkan bucket/count setelah invalidation.
- **Effort:** M

### CSN-09 — Scope counter non-ADMIN berbeda dari scope team visibility

- **Severity:** Medium
- **Status:** confirmed
- **Area:** Team Inbox / counter parity
- **Evidence:** BE `conversation.service.ts:1332-1341,6477`; `buildCountResponse:1233-1287`.
- **Temuan:** `resolveTeams` memfilter semua non-ADMIN, tetapi `shouldScopeByTeam` hanya AGENT/SUPERVISOR. Re-verifikasi mengoreksi klaim lama: daftar dan badge tetap dibatasi map team hasil filter; ini bukan leak team di luar daftar, melainkan potensi per-team count memasukkan shared conversation dengan scope berbeda.
- **Dampak:** badge dapat tidak sama dengan list untuk MANAGER/SUPER_ADMIN/TEAM_LEAD/USER.
- **Remediation:** samakan scope dengan `resolveTeams` (`role !== ADMIN`) atau gunakan shared scope builder.
- **Acceptance:** badge per team sama dengan jumlah list visible untuk seluruh role matrix.
- **Effort:** S-M

### CSN-10 — Coverage guard AGENT lintas entry point belum dibuktikan lengkap

- **Severity:** Medium
- **Status:** needs-validation
- **Area:** Team Inbox / authorization
- **Evidence:** guard ditemukan di `conversation.repository.ts:2584,2746-2754,3663-3677`; dipakai jalur list/count yang direview.
- **Koreksi:** klaim lama “AGENT bisa bypass dengan `assign=false`” diretract. Repository memaksa participant filter untuk AGENT, termasuk role SALES karena cek memakai code.
- **Sisa risiko:** audit belum membuktikan semua entry point/aggregation conversation melewati guard yang sama.
- **Validation:** inventaris semua controller/gRPC/event read path yang mengembalikan conversation list dan trace ke scope builder.
- **Remediation:** bila ada bypass path, pusatkan authorization scope pada satu shared BE boundary.
- **Acceptance:** seluruh read path role AGENT selalu membatasi participant/team sesuai policy.
- **Effort:** M

### CSN-11 — Hak create-team untuk MANAGER/TEAM_LEAD belum dikunci

- **Severity:** Low
- **Status:** needs-decision
- **Area:** Team Inbox / capability
- **Evidence:** FE `ConversationNavItemDefault.tsx:294-295`.
- **Koreksi:** ini bukan bug terkonfirmasi. Implementasi hanya mengizinkan SUPERVISOR/ADMIN; requirement MANAGER/TEAM_LEAD belum ditemukan.
- **Decision:** PM+Tech mengunci capability matrix create-team.
- **Remediation:** ubah gate hanya bila matrix memberi permission; tetap enforce di BE.
- **Acceptance:** FE visibility dan BE authorization mengikuti matrix yang sama.
- **Effort:** S

### CSN-12 — Union team assignment belum terdokumentasi

- **Severity:** Low
- **Status:** confirmed
- **Area:** Team Inbox / documentation
- **Evidence:** BE `conversation.service.ts:5555-5582`.
- **Temuan:** non-ADMIN dapat melihat team yang bukan membership langsung bila memiliki assigned conversation pada team itu. Perilaku tampak intentional, tetapi tidak terdokumentasi dekat contract counter/sidebar.
- **Dampak:** engineer/QA dapat menganggapnya leak dan membangun test/fix yang salah.
- **Remediation:** dokumentasikan union rule dan tambahkan satu contract test.
- **Acceptance:** test membuktikan assigned conversation mempertahankan visibility team tanpa membuka conversation lain yang tidak berhak.
- **Effort:** S

---

## 5. Koreksi dan Retraction

| Klaim lama | Resolusi kanonik |
|---|---|
| C2: sidebar menampilkan badge team di luar team user | **Dikoreksi.** Map output tetap dibatasi team hasil `resolveTeams`; masalahnya parity scope/count, bukan exposure row asing. |
| C3: AGENT dapat bypass dengan `assign=false` | **Diretract.** Guard AGENT ada di repository untuk jalur yang diverifikasi. Coverage semua entry point tetap needs-validation (CSN-10). |
| C5: MANAGER/TEAM_LEAD tidak bisa create team adalah bug | **Dikoreksi.** Capability gap/decision, bukan defect tanpa requirement. |
| F1: tambah `if (!channelMap.has(...)) continue` selalu aman | **Dikoreksi.** Guard dapat membuang bucket sintetis; policy parent-channel harus dikunci dulu (CSN-05). |
| Counter Fix1, channel F2, role-cache C4 adalah tiga akar berbeda | **Dedup.** Semuanya trigger dari satu lifecycle invalidation counter yang tidak lengkap (CSN-02). |

---

## 6. Prioritas Eksekusi

1. **P0 — CSN-01:** perbaiki dua role gate FE; regression test SALES dan SUPERVISOR SALES.
2. **P1 — CSN-02:** pusatkan lifecycle invalidation counter; tambahkan fallback terukur.
3. **P1 — CSN-03/09:** buktikan dan samakan query parity count/list serta team scope.
4. **P2 — CSN-06/07:** hilangkan pagination/filter dan whitelist trap.
5. **Decision — CSN-05/11:** PM+Tech lock bucket turunan channel dan capability create-team.
6. **Hardening — CSN-04/08/10/12.**

---

## 7. Overlap dengan Track Lain

- **SEC-03 register** adalah kontrol positif RBAC di BE gateway; **CSN-01** adalah gate visibility FE yang rusak. Keduanya benar pada layer berbeda.
- Track B/D mencatat gap visibility/assignment secara UX; CSN-01 memberi root cause code untuk sidebar. Saat ticketing, link sebagai evidence, jangan buat bug duplikat.
- CSN-03/09 beririsan dengan temuan count/list pada Track D/E; gunakan CSN sebagai owner untuk scope sidebar, dan link issue BE yang lebih luas bila ditemukan.

---

## 8. Acceptance Matrix Minimum

| Skenario | Expected |
|---|---|
| SALES (`code=AGENT`) login | `Unassigned`/`All` hidden; list tetap participant-scoped. |
| SUPERVISOR SALES login | Create-team mengikuti matrix capability final. |
| Existing conversation menerima inbound | Counter dan list kembali parity tanpa hard refresh. |
| Channel activate/deactivate | Row/count berubah setelah event/fallback; inactive tidak bocor. |
| Company memiliki >25 channel | Semua active channel muncul. |
| MANAGER/TEAM_LEAD/USER membuka team | Badge sama dengan visible list berdasarkan policy. |
| Role user berubah | Counter lama tidak dipakai dengan scope baru. |
| Socket counter membawa userId invalid | Tidak cross-user update; recovery/telemetry berjalan. |

Hasil di atas adalah desain acceptance test, bukan klaim hasil eksekusi.
