# Assessment Report — Conversation Snooze (Conversation List)

> **Assessment Type:** Type 1 — Feature Development Analysis
> **Owner:** Analyst
> **Source PRD:** `PRD/Conversationv2/PRD Ticket - Conversation Snooze (Conversation List).md` (v1.0, 2026-01-23)
> **Legacy/Cross-reference:** `PRD/Conversation/PRD Inbox Conversation - snooze conversation.md` (V1, deprecated)
> **Source Change Intake Brief:** not-applicable — **none found** (governance gap, see F-16)
> **Assessment Artifact Path:** `Assessments/conversation/conversation-snooze/conversation-snooze-qa-assessment.md`
> **Version:** v1.0
> **Rules Applied:** `Rules/core/analysis-and-risk.md`, `Rules/core/task-router.md`, `Rules/core/change-management.md`, `Rules/profiles/satuinbox.yml`
> **Reference Context:** `Memory/global-memory.md`, `Assessments/reference/conversation-prd-cross-analysis.md`, `Assessments/reference/conversation-sla-rlt-frt-ttc-analysis.md`, `Assessments/audit/audit-master-register.md`
> **Tanggal Analisa:** 2026-09-02
> **Status:** Draft

---

## Executive Summary

Snooze Conversation adalah fitur lifecycle/state-machine yang menambahkan atribut snooze (`snooze_until`, `snooze_wake_reason`) di atas status conversation `open`/`closed` tanpa mengubah status (FR-002). Fitur ini **belum diimplementasi** di FE maupun BE (global-memory §Open Risks: "8 fitur Conversation V2 belum diimplementasi… Snooze Conversation… BE juga belum"; cross-analysis: Snooze Conversation = UNDEVELOPED, hanya Ticket Snooze yang ada). Analisis dilakukan pada level PRD, bukan verifikasi kode — tidak ada hasil eksekusi yang diklaim.

Happy path PRD tergolong lengkap (FR-001…FR-024, EH-001…EH-005, EC-001…EC-007). Namun fitur ini membawa **1 conflict Catastrophe yang belum ter-resolve** (3-way SLA pause: Hold vs Snooze vs RLT Adjusted — sudah tercatat di audit master register sebagai V1) plus **rangkaian requirement gap di lapisan wake-mechanism, idempotency, permission, dan multi-tenant scoping**. Conflict SLA ini bersifat *decision-level* (keputusan PM+Eng), bukan defect kode, sehingga tidak bisa diselesaikan oleh implementer tanpa keputusan.

**Finding counts:** 17 total — P1 High: 5, P2 Medium: 10, P3 Low: 1, P4 Info: 1.
Kategori: REQUIREMENT GAP: 9, INCONSISTENCY: 4, DESIGN FLAW: 1, SECURITY ISSUE: 1, DATA INTEGRITY ISSUE: 1, OPERABILITY ISSUE: 1, DEFECT: 1.

**Top risks:** (1) hidden conversation + SLA running = silent SLA breach; (2) wake mechanism & idempotency undefined → missed wake / double notification; (3) closed-room immutability vs snooze-closed conflict; (4) auto-unsnooze trigger & inbound-event-drop path undefined → missed customer message; (5) multi-tenant/team scope untuk snooze list & count tidak eksplisit.

**Decision: REVISE_PRD** — PRD perlu revisi untuk me-lock decision SLA pause (atau eksplisit men-dokumentasi "no pause" + konsekuensinya), mendefinisikan wake scheduler + idempotency key, melengkapi permission matrix cancel/edit, dan mempertegas multi-tenant scoping. Fitur bernilai dan layak dibangun, tapi tidak aman untuk dibekukan dalam bentuk sekarang.

---

## System Model

### Actors
- **Agent** — snooze conversation milik sendiri (FR-009); tidak boleh snooze unassigned (FR-011).
- **Supervisor / Admin** — snooze conversation apa pun dalam Team Inbox scope (FR-010).
- **Scheduler/Worker (internal service)** — auto-wake saat `snooze_until` tercapai (FR-005).
- **Inbound pipeline (internal service)** — auto-unsnooze saat customer message masuk (FR-007).
- **Reminder service (internal)** — precedence/deferral saat snooze aktif (FR-023).

### Components
- **FE (Next.js, omnichannel):** top chips bar (+"Snoozed" + count), filter dropdown, row action menu, snooze modal, snoozed list row, empty state.
- **BE (NestJS, Nx monorepo, conversation-service):** snooze CRUD, permission enforcement, count endpoint, wake logic.
- **Scheduler/worker:** time-reached wake dispatch — **tidak dispesifikasikan** (delayed queue vs poll vs cron, F-03).
- **Notification service:** in-app "Snooze selesai" (FR-006), "Gagal membangunkan snooze" (EH-003).
- **Socket.IO:** propagasi list/count update ≤2s (NFR Performance).

### Data and source of truth
| Field | Type | Source of truth | Lifecycle |
|---|---|---|---|
| `snooze_until` | Datetime (WIB display) | conversation doc | set → cleared on wake |
| `snooze_preset` | Enum (optional) | UI only, converts to until | transient |
| `snooze_note` | Text ≤200 | conversation doc | **retention undefined (F-13)** |
| `snooze_set_by` | User ref (system) | conversation doc | audit |
| `snooze_set_at` | Datetime (system) | conversation doc | audit |
| `snooze_wake_reason` | Enum TIME_REACHED/INBOUND_MESSAGE/MANUAL_CANCEL | conversation doc | set on wake |
| `status` | `open`/`closed` | conversation doc | **unchanged by snooze (FR-002)** |

Catatan: model data canonical memakai `status` + `participants` (assignee). Snooze adalah **state**, bukan status (align dengan Ticket Rules: "Snooze is a state, not a status change"). Tidak ada field eksplisit "original list" — return-to-list diturunkan dari `status`, namun interaksi status-change-while-snoozed tidak didefinisikan (F-13).

### Dependencies
- Chat List filter intersection `Inbox ∩ Channel ∩ Team ∩ RBAC` (global-memory).
- Reminder service (precedence FR-023).
- SLA engine (pause policy — conflict, F-01).
- Socket/event propagation (list + count ≤2s).
- Auto-reply/bot availability (interaction undefined, F-06).

### State machine (proposed)
```
(normal, open/closed) --set snooze--> (snoozed) --TIME_REACHED--> (normal, original status)
                                          |--INBOUND_MESSAGE--> (normal, open)  [FR-007]
                                          |--MANUAL_CANCEL----> (normal, original status)
(snoozed) --edit snooze_until--> (snoozed, new until)
```
Allowed transitions terlihat jelas di happy path. Transisi yang **tidak didefinisikan**: status change saat snoozed; reassignment saat snoozed (EC-002 ada tapi permission cancel/edit oleh assignee baru tidak); snooze unassigned → wake target.

---

## Traceability

| Requirement | Business Rule | Use Case | Flow | Component | API/DB | Integration | Test Scenario | Expected |
|---|---|---|---|---|---|---|---|---|
| FR-001 | set snooze future | US-001 | set | FE modal + BE | POST snooze | — | set until future | hidden from Open, in Snoozed |
| FR-002/FR-005 | no status change; wake returns to original list | US-002 | wake | worker | conversation doc | scheduler | reach until | status unchanged, returns to list |
| FR-006 | in-app notif "Snooze selesai" | US-001 | wake | notification | — | notif svc | wake | assignee notified |
| FR-007/FR-008 | auto-unsnooze on inbound; record reason | US-003 | inbound | inbound pipeline | conversation doc | socket | customer msg | unsnooze ≤2s, reason=INBOUND_MESSAGE |
| FR-009…FR-012 | RBAC snooze | US-004 | authz | BE guard | — | RBAC | agent snooze unassigned | blocked "Akses ditolak" |
| FR-013…FR-016 | Snoozed chip + count + filter | US-004 | list | FE chips + BE count | count endpoint | socket | supervisor view | chip + accurate count |
| FR-017/FR-018 | sort by soonest until; label | US-004 | list | FE + BE sort | — | — | open Snoozed view | asc sort + label |
| FR-019…FR-021 | cancel/edit; return immediately | US-002 | manual | FE + BE | PATCH/DELETE snooze | socket | cancel | immediate return |
| FR-022…FR-024 | snooze = hide + wake reminder; precedence | US-005 | precedence | BE + reminder svc | — | reminder | reminder inside window | deferred to until |

Gap utama traceability: **tidak ada requirement → test mapping untuk wake idempotency, wake-reason precedence, dan multi-tenant scoping** (karena requirement-nya sendiri belum ada — F-03/F-04/F-12).

---

## Findings

### F-01 P1 High INCONSISTENCY — SLA pause 3-way conflict belum ter-resolve
**Status:** Confirmed (conflict antar PRD; keputusan belum diambil)
**Location:** requirement/SLA policy
**Scenario:** Conversation disnooze; SLA FRT/TTC running; agent tidak bisa reply karena hidden.
**Expected:** Satu kebijakan SLA pause yang konsisten untuk Hold, Snooze, dan RLT Adjusted.
**Actual / Failure Mode:** V2 Snooze (file 16) eksplisit "No SLA pause changes"; V2 Room v1.1 (file 9) bilang Hold pause SLA; V2 Response Metrics (file 3) bilang RLT Adjusted "if existing policy supports". Tiga aturan saling bertentangan. Terdaftar di audit master register sebagai **V1 (Catastrophe, needs-validation)**.
**Root Cause:** Tidak ada SLA Engine Contract tunggal; tiap PRD mendefinisikan pause secara independen.
**Evidence:** PRD §15 "No SLA pause changes"; global-memory §Room Rules "3-way conflict masih open"; audit-master-register.md V1; conversation-sla-rlt-frt-ttc-analysis.md Finding 3.
**Impact:** Implementasi snooze akan mengambil keputusan pause secara implisit → metrik SLA inkonsisten antar fitur.
**Blast Radius:** semua conversation yang disnooze + Hold; FRT/TTC/RLT; reporting SLA.
**Recommendation:** Lock SLA pause policy di decision meeting PM+Eng SEBELUM snooze diimplementasi; hasilnya jadi SLA Engine Contract dan direferensikan FR snooze.
**Suggested Test:** N/A (decision-level) — setelah locked, test "snooze selama window TTC → TTC tetap/berhenti sesuai kebijakan".

### F-02 P1 High DESIGN FLAW — hidden + SLA running = silent breach
**Status:** Confirmed (konsekuensi logis dari FR-003 + "no SLA pause")
**Location:** workflow/SLA
**Scenario:** Conversation disnooze (hidden dari Open/Closed). SLA FRT/TTC terus berjalan. Tidak ada agent yang melihat countdown.
**Expected:** Tidak ada conversation yang brek SLA tanpa terlihat.
**Actual / Failure Mode:** Karena snooze tidak pause SLA dan menyembunyikan item, breach terjadi senyap; agent baru tahu saat wake. PRD §12 mengakui risiko "SLA and customer experience risk" tapi mitigasinya hanya "add monitoring on inbound while snoozed" (tidak menyelesaikan breach diam).
**Root Cause:** Kombinasi "no SLA pause" + "hide from list" tanpa mekanisme visibility breach saat snoozed.
**Evidence:** PRD FR-003 + §15 + §12; cross-analysis Loophole 7.
**Impact:** FRT/TTC breach tidak terdeteksi; OKR "0 critical bugs related to hidden conversations" (OKR §4) berisiko gagal.
**Blast Radius:** semua tenant; agent; SLA dashboard/reporting; supervisor oversight.
**Recommendation:** Salah satu: (a) snoozed tetap terlihat di Snoozed view DENGAN SLA countdown, atau (b) pause SLA saat snooze (butuh keputusan F-01), atau (c) alert breach ke supervisor saat conversation snoozed.
**Suggested Test:** Snooze conversation dengan TTC ≤10% sisa → verifikasi breach terlihat oleh agent/supervisor selama snooze.

### F-03 P1 High REQUIREMENT GAP — wake scheduler/worker mechanism tidak dispesifikasikan
**Status:** Confirmed (absence)
**Location:** component/scheduler-worker
**Scenario:** `snooze_until` tercapai; sistem harus wake.
**Expected:** Mekanisme terdefinisi: scheduler polling, delayed queue, atau cron; interval; DLQ; retry EH-003 (5× dalam 10 menit, exponential backoff); idempotency.
**Actual / Failure Mode:** PRD hanya menyebut "retry up to 5 attempts within 10 minutes" (EH-003) tanpa komponen scheduler, queue, DLQ, atau reconciliation job. Jika worker mati/down, snooze tidak pernah wake. Tidak ada reconciliation job untuk mendeteksi snooze yang melampaui `snooze_until` tanpa wake.
**Root Cause:** PRD fokus behavior, tidak pada delivery mechanism.
**Evidence:** PRD §7 EH-003, §11 Reliability; absence grep konsep scheduler/queue di PRD.
**Impact:** Missed wake = conversation tertahan tersembunyi = missed follow-up (problem statement #1).
**Blast Radius:** semua snooze; wake success KPI ≥99%.
**Recommendation:** Definisikan delivery: delayed queue (RMQ) atau scheduler sweep `snooze_until <= now` + idempotency key; tambah reconciliation job; definisikan DLQ untuk EH-003.
**Suggested Test:** Matikan worker saat `snooze_until` lewat → restart → conversation wake dalam satu cycle (tidak ganda, tidak hilang).

### F-04 P1 High REQUIREMENT GAP — wake idempotency & wake-reason precedence tidak terdefinisi
**Status:** Confirmed (absence)
**Location:** workflow/wake
**Scenario:** Tiga jalur wake bertabrakan: TIME_REACHED (scheduler), INBOUND_MESSAGE (FR-007), MANUAL_CANCEL (FR-019) — dan edit `snooze_until` (FR-020).
**Expected:** Idempotent wake; final state unsnoozed sekali; **satu** notifikasi; wake_reason deterministik saat race.
**Actual / Failure Mode:** EC-006 mengklaim "Ensure idempotent wake. Single notification at most" tapi tidak ada idempotency key, unique constraint, atau state-check. Race: inbound message tiba persis saat time-reached → wake_reason mana yang dicatat? Dua notifikasi? Edit `snooze_until` commit ke T+2h setelah wake job membaca T → wake tetap fire pada T (kontradiksi EH-004 last-write-wins).
**Root Cause:** Idempotency dinyatakan sebagai goal tanpa mekanisme.
**Evidence:** PRD EC-006, EH-004, FR-007, FR-008, FR-020.
**Impact:** Double notification, wake_reason salah, atau conversation wake terlalu dini setelah edit.
**Blast Radius:** assignee (notifikasi ganda); audit trail wake_reason.
**Recommendation:** Tambah idempotency key / state-check (wake hanya jika masih `snoozed`), definisikan precedence reason (INBOUND > TIME > MANUAL), dan serialisasi wake vs edit via optimistic concurrency.
**Suggested Test:** Trigger inbound + time-reached simultan → satu wake, satu notifikasi, reason deterministik.

### F-05 P1 High INCONSISTENCY — closed-room immutability vs snooze closed conversation
**Status:** Confirmed (conflict antar rule)
**Location:** data model/state machine
**Scenario:** EC-004 + FR-003 memperbolehkan snooze conversation berstatus `closed` (hidden dari Closed list, kembali ke Closed saat wake).
**Expected:** Konsisten dengan aturan lifecycle closed room.
**Actual / Failure Mode:** global-memory §Room Chat "Closed room immutable". Snooze menulis field `snooze_until` dkk ke conversation `closed` → melanggar immutability. Tidak dijelaskan apakah "immutable" berlaku ke seluruh dokumen atau hanya status.
**Root Cause:** Rule immutability closed room tidak didefinisikan presisi; snooze PRD tidak menyebut constraint ini.
**Evidence:** PRD EC-004; global-memory §Room Chat; §Chat List.
**Impact:** Potensi write ke closed room yang seharusnya immutable; inkonsistensi data model.
**Blast Radius:** semua conversation closed yang disnooze.
**Recommendation:** Klarifikasi scope "immutable" closed room (status-only vs whole-doc). Jika whole-doc, EC-004 perlu direvisi atau snooze closed harus di-allow dengan pengecualian eksplisit.
**Suggested Test:** Snooze conversation closed → verifikasi write field snooze diperbolehkan/tolak sesuai keputusan.

### F-06 P2 Medium REQUIREMENT GAP — trigger "new inbound customer message" tidak terdefinisi
**Status:** Confirmed (absence)
**Location:** inbound pipeline/auto-unsnooze
**Scenario:** FR-007 "new inbound customer message" → auto-unsnooze.
**Expected:** Definisi presisi: pesan dari customer (bukan bot/auto-reply/system); exclude internal note; exclude welcome message.
**Actual / Failure Mode:** Tidak ada definisi apa yang dihitung. Cross-analysis Loophole 7: auto-reply bot terkirim saat "no agent available" → customer balas → auto-unsnooze → agent kaget. Apakah auto-reply itu sendiri memicu wake? Internal message dari agen lain?
**Root Cause:** Istilah "inbound customer message" ambigu.
**Evidence:** PRD FR-007; cross-analysis Loophole 7; global-memory §Auto-reply (FR-048).
**Impact:** Wake prematur / tidak diharapkan; interaksi dengan auto-reply tidak jelas.
**Blast Radius:** conversation yang disnooze + auto-reply aktif.
**Recommendation:** Definisikan event yang memicu unsnooze (customer-authored message only; exclude bot/auto-reply/internal/system).
**Suggested Test:** Snooze + auto-reply aktif → auto-reply terkirim → verifikasi tidak wake; customer balas → wake.

### F-07 P2 Medium REQUIREMENT GAP — permission matrix cancel/edit + reassignment inheritance tidak terdefinisi
**Status:** Confirmed (absence)
**Location:** authorization
**Scenario:** Conversation disnooze agent A, lalu reassign ke agent B (EC-002) sebelum wake.
**Expected:** Aturan jelas siapa yang bisa cancel/edit snooze: setter? assignee? supervisor?
**Actual / Failure Mode:** FR-019 "Users MUST be able to cancel snooze" — "Users" tidak dispesifikasikan. EC-002 bilang snooze ownership transfer ke assignee baru, tapi tidak bilang apakah B bisa cancel snooze yang diset A, atau apakah A (bukan assignee lagi) masih bisa edit. FR-009/FR-010 hanya mengatur *set*, bukan *cancel/edit*.
**Root Cause:** Permission matrix hanya untuk action "set snooze".
**Evidence:** PRD FR-009…FR-012, FR-019/FR-020, EC-002.
**Impact:** Cancel/edit oleh pihak yang salah → reassignment ownership tidak konsisten.
**Blast Radius:** RBAC; assignee baru; supervisor oversight.
**Recommendation:** Lengkapi matrix: siapa boleh cancel/edit (setter, current assignee, supervisor/admin in scope) + perilaku saat reassignment.
**Suggested Test:** A snooze → reassign ke B → verifikasi B boleh cancel & A tidak (atau sesuai keputusan).

### F-08 P2 Medium REQUIREMENT GAP — wake target untuk snoozed unassigned tidak terdefinisi
**Status:** Confirmed (absence)
**Location:** state machine/wake
**Scenario:** Supervisor snooze conversation unassigned (FR-010 mengizinkan; FR-011 hanya larang Agent). Wake terjadi.
**Expected:** Target list untuk return didefinisikan.
**Actual / Failure Mode:** PRD hanya mendefinisikan return ke Open atau Closed (FR-005). Unassigned conversation tidak masuk Open/Closed; return target tidak ada. View "Unassigned" (global-memory nav model) tidak dibahas.
**Root Cause:** PRD mengasumsikan semua conversation assigned.
**Evidence:** PRD FR-005, FR-010, FR-011; global-memory §Chat List nav.
**Impact:** Wake unassigned → conversation "hilang" atau masuk view yang salah.
**Blast Radius:** unassigned snoozed conversation.
**Recommendation:** Definisikan return untuk unassigned (→ Unassigned view).
**Suggested Test:** Supervisor snooze unassigned → wake → verifikasi muncul di Unassigned view.

### F-09 P2 Medium REQUIREMENT GAP — reminder deferral cross-user tidak terdefinisi
**Status:** Confirmed (absence)
**Location:** reminder precedence
**Scenario:** Conversation punya reminder milik agent B; agent A set snooze. FR-023 mendefer reminder B ke `snooze_until`.
**Expected:** Perilaku deferral yang tidak merusak reminder user lain.
**Actual / Failure Mode:** global-memory §Detail "reminder user-specific unless PM clarifies shared/team reminder". FR-023 mendefer "any reminder scheduled inside snooze window" tanpa membedakan owner. Deferral diam-diam mengubah reminder agent lain.
**Root Cause:** Precedence rule tidak aware ownership reminder.
**Evidence:** PRD FR-023; global-memory §Detail Rules.
**Impact:** Reminder milik agen lain diubah tanpa pemberitahuan.
**Blast Radius:** reminder user-specific lintas agent.
**Recommendation:** Clarify ownership reminder; deferral hanya untuk reminder setter (atau beri notifikasi ke owner reminder).
**Suggested Test:** A set snooze dengan reminder B di window → verifikasi reminder B tidak berubah (atau B dinotifikasi).

### F-10 P2 Medium REQUIREMENT GAP — batas atas snooze_until / timezone / clock skew tidak terdefinisi
**Status:** Confirmed (absence)
**Location:** validation
**Scenario:** User set snooze 10 tahun; server bandingkan "greater than now" dengan clock skew; preset "Besok 09.00".
**Expected:** Batas maksimum durasi; perlakuan timezone konsisten; validasi clock-skew-safe.
**Actual / Failure Mode:** Field §10 hanya "Must be greater than now. Uses WIB display". Tidak ada upper bound. "Besok 09.00" ambigu (WIB? server UTC?). Clock skew bisa membuat "past" lolos atau "future" ditolak.
**Root Cause:** Validasi time/date tidak lengkap.
**Evidence:** PRD §10, §9 presets.
**Impact:** Conversation tersembunyi tak terbatas; validasi timezone salah.
**Blast Radius:** semua snooze; lintas timezone tenant.
**Recommendation:** Definisikan max snooze (mis. 30 hari), simpan UTC, tampilkan WIB, validasi server-side dengan tolerance skew.
**Suggested Test:** Set until > max → block; set "Besok 09.00" → preview WIB benar; set until = now + 1s → diterima (EC-005).

### F-11 P2 Medium INCONSISTENCY — "Snoozed chip alongside Open/Closed" vs model navigasi aktual
**Status:** Confirmed (conflict)
**Location:** UI/navigation
**Scenario:** FR-013 "add Snoozed chip alongside Open, Closed".
**Expected:** Penempatan konsisten dengan model navigasi V2 aktual.
**Actual / Failure Mode:** global-memory §Chat List nav = "Your Inbox, Unassigned, All, Closed, Starred, Spam, Junk" (filter buttons, bukan chip status). Tidak ada chip "Open" (Open = default). PRD mengasumsikan chips "Open/Closed" yang tidak match implementasi. EC-007 filter interaksi dengan intersection `Inbox ∩ Channel ∩ Team ∩ RBAC` juga tidak dispesifikasikan (Snoozed = level filter mana?).
**Root Cause:** PRD menulis terhadap model navigasi yang tidak sesuai V2 aktual.
**Evidence:** PRD FR-013, EC-007; global-memory §Chat List Rules + §Filtering.
**Impact:** Penempatan chip ambigu; perilaku filter Snoozed tidak konsisten dengan intersection rule.
**Blast Radius:** UX navigasi; filter scope.
**Recommendation:** Re-align penempatan "Snoozed" ke model nav V2 (sebagai filter button tambahan), definisikan interaksi dengan Inbox/Channel/Team/RBAC intersection.
**Suggested Test:** Kombinasi filter Snoozed × Channel × Team × RBAC → verifikasi irisan benar.

### F-12 P2 Medium SECURITY ISSUE — multi-tenant & team scope untuk snooze list/count tidak eksplisit
**Status:** Confirmed (absence)
**Location:** API/query scope
**Scenario:** Endpoint list snoozed + count badge dipanggil user dalam tenant/team tertentu.
**Expected:** Scope ketat `tenant × team × RBAC`; no IDOR.
**Actual / Failure Mode:** FR-004 "lists all snoozed conversations accessible to the user"; FR-014/FR-016 count. Tidak ada enforcement query scope eksplisit (tenant ID, team ID) pada list/count. FR-010 "Team Inbox scope" hanya disebut untuk action snooze, bukan untuk list/count query.
**Root Cause:** Isolation hanya di action, tidak di query read path.
**Evidence:** PRD FR-004, FR-010, FR-013…FR-016; §11 Security "Prevent access outside Team Inbox scope" (tanpa detail).
**Impact:** Potensi IDOR / cross-tenant leak pada count & list snoozed.
**Blast Radius:** multi-tenant; semua user.
**Recommendation:** Definisikan query scope count & list = `tenant × team × RBAC` di backend (bukan FE-only); tambah negative test cross-tenant.
**Suggested Test:** User tenant A query snoozed list → verifikasi tidak melihat conversation tenant B.

### F-13 P2 Medium DATA INTEGRITY ISSUE — lifecycle field snooze post-wake + status change saat snoozed tidak terdefinisi
**Status:** Confirmed (absence)
**Location:** data model
**Scenario:** Wake terjadi; lalu conversation di-close saat masih snoozed (dari detail, EC-003 tetap accessible).
**Expected:** State field snooze bersih/diaudit; perilaku status-change-while-snoozed jelas.
**Actual / Failure Mode:** Tidak ada definisi apakah `snooze_until` di-clear, `snooze_note` dipertahankan untuk audit, atau `snooze_wake_reason` direset. Tidak ada definisi apakah conversation boleh di-close saat snoozed dan dampaknya ke return list.
**Root Cause:** Lifecycle field tidak dispesifikasikan melebihi "set on wake".
**Evidence:** PRD §10 fields; FR-002; EC-003; EC-004.
**Impact:** Field stale; return-list salah saat status berubah di tengah snooze.
**Blast Radius:** audit trail; data model conversation.
**Recommendation:** Definisikan post-wake field state (clear until, keep note+reason+set_by untuk audit), dan status-change-while-snoozed (allow close → wake return ke Closed).
**Suggested Test:** Close saat snoozed → wake → verifikasi return ke Closed + field snooze bersih + reason tercatat.

### F-14 P2 Medium REQUIREMENT GAP — snooze_until edit vs wake race tidak konsisten dengan idempotent wake
**Status:** Confirmed (absence)
**Location:** concurrency
**Scenario:** Scheduler baca `snooze_until = T` dan dispatch wake; user edit ke `T+2h` commit tepat setelah baca.
**Expected:** Wake tidak fire pada T (karena edit sah).
**Actual / Failure Mode:** EH-004 "last write wins, log both" tapi wake job sudah memegang T. Edit commit setelah baca → wake tetap fire pada T → conversation wake lebih dini dari yang diedit. Kontradiksi dengan EC-006 (idempotent wake) yang tidak meng-cover edit-vs-wake race.
**Root Cause:** Optimistic concurrency EH-004 tidak diterapkan ke interaksi edit↔wake.
**Evidence:** PRD EH-004, EC-006, FR-020.
**Impact:** Conversation wake prematur setelah edit; user bingung.
**Blast Radius:** assignee; conversation yang diedit dekat wake time.
**Recommendation:** Wake re-validasi `snooze_until` terhadap clock saat eksekusi (state-check); edit & wake pakai optimistic versioning.
**Suggested Test:** Edit until ke T+2h sesaat sebelum T → verifikasi wake tidak fire di T (fire di T+2h).

### F-15 P3 Low OPERABILITY ISSUE — wake success KPI ≥99% tidak terukur akurat
**Status:** Confirmed (absence)
**Location:** observability
**Scenario:** KPI "Wake success rate ≥99% from event logs" (PRD §13).
**Expected:** Event yang bisa membedakan success vs retry vs fail; idempotency key.
**Actual / Failure Mode:** Tanpa idempotency key & event distinct (F-03/F-04), sulit mengukur "success" tanpa double-count retry. NFR observability hanya daftar event snooze_set/edit/cancel/wake tanpa schema.
**Root Cause:** Metrik didefinisikan sebelum mekanisme wake.
**Evidence:** PRD §13, §11 Observability.
**Impact:** KPI tidak reliable.
**Blast Radius:** reporting; stakeholder.
**Recommendation:** Definisikan event schema wake (success/fail/retry + idempotency key) saat mekanisme F-03 dikerjakan.
**Suggested Test:** N/A (observability).

### F-16 P2 Medium DEFECT — phase0 change-intake brief tidak ada (non-bypassable)
**Status:** Confirmed (absence)
**Location:** governance/process
**Scenario:** Snooze = NEW_CAPABILITY (tambah behavior). `phase0_change_intake` + `change_intake_brief` non-bypassable per profile.
**Expected:** Change-intake brief dipersist + versioned sebelum analisa/implementasi.
**Actual / Failure Mode:** Tidak ada `*-change-intake-brief.md` untuk snooze di `Assessments/conversation/` (hanya web-mobile-parity, auto-pull-round-robin, post-login-workspace, incident-amplification). Demand screen (change-management §Demand screen L0-L4) juga belum terekam.
**Root Cause:** Pipeline analisa dimulai tanpa brief; atau brief di luar scope repositori.
**Evidence:** Profile `governance.non_bypassable`; change-management.md; absence file di Assessments/conversation/.
**Impact:** Kontrol governance phase0 terlewati; demand level (L3 vs L1) tidak tervalidasi.
**Blast Radius:** proses; traceability.
**Recommendation:** Buat change-intake brief (dengan demand screen) sebagai prasyarat, atau tandai status eksplisit mengapa dikecualikan (jangan diam-diam).
**Suggested Test:** N/A (process).

### F-17 P4 Info INCONSISTENCY — metadata PM/Eng Lead PRD tidak match profile
**Status:** Confirmed
**Location:** PRD header
**Scenario:** Metadata author/owner dokumen.
**Expected:** Author = Dany Christian (PM), Eng Lead = Naftal Yunior (profile owners).
**Actual / Failure Mode:** PRD header: PM "Yusril Ibnu Maulana", Eng Lead "Naftal" (tanpa surname); V1 Design Lead "Resky" vs V2 "Sabrina". Profile `owners.pm = Dany Christian`, `owners.engineering_lead = Naftal Yunior`.
**Root Cause:** PRD source memakai author berbeda dari profile ownership.
**Evidence:** PRD header §; profile `owners:`.
**Impact:** Konsistensi metadata author/owner.
**Blast Radius:** dokumentasi.
**Recommendation:** Alignment metadata saat PRD revisi (jangan overwrite source PRD tanpa perintah; catat sebagai note).
**Suggested Test:** N/A.

---

## Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|---|---|---|---|
| OQ-01 | Apakah snooze pause SLA atau tidak? (F-01) | Determinan F-02 (silent breach) | **Yes** |
| OQ-02 | Delivery mechanism wake: delayed queue vs scheduler sweep? (F-03) | Menentukan arsitektur + reliability | **Yes** |
| OQ-03 | Siapa yang boleh cancel/edit snooze, termasuk setelah reassignment? (F-07) | RBAC matrix | Yes |
| OQ-04 | Apakah closed room immutable seluruh dokumen (blokir snooze closed)? (F-05) | Data model | Yes |
| OQ-05 | Apa definisi "inbound customer message" untuk auto-unsnooze (exclude bot/auto-reply)? (F-06) | Perilaku wake | Yes |
| OQ-06 | Scope count & list snoozed: tenant × team × RBAC? (F-12) | Isolation/IDOR | Yes |
| OQ-07 | Max duration snooze + timezone storage (UTC vs WIB)? (F-10) | Validasi | No |
| OQ-08 | Return target unassigned snoozed saat wake? (F-08) | State machine | No |
| OQ-09 | Reminder deferral cross-user: hanya setter? (F-09) | Precedence | No |

---

## Recommendation / Next Action

**Decision Enum: REVISE_PRD** — **Decision Class: NO_GO (sebagai bentuk sekarang)** / conditional pada revisi.

Fitur bernilai dan scope-nya terdefinisi baik di happy path, tapi 5 finding P1 semuanya bersifat *decision-level* (F-01 SLA pause, F-02 silent breach, F-03 wake mechanism, F-04 idempotency, F-05 closed immutability) yang harus di-lock sebelum PRD bisa dibekukan. Tidak ada defect kode yang bisa diverifikasi (fitur belum diimplementasi), sehingga keputusan bukan HOLD karena alasan implementasi — melainkan REVISE karena requirement-nya sendiri belum aman.

**Required Actions Before Development (urutan):**
1. Lock SLA pause policy (OQ-01) — decision meeting PM+Eng; hasil masuk SLA Engine Contract + dirujuk PRD snooze.
2. Definisikan wake scheduler + idempotency key + reconciliation job (F-03/F-04).
3. Lengkapi permission matrix cancel/edit + reassignment (F-07).
4. Klarifikasi closed-room immutability vs snooze closed (F-05).
5. Definisikan "inbound customer message" trigger (F-06) dan multi-tenant scope count/list (F-12).
6. Buat change-intake brief phase0 (F-16) sebelum freeze.

**Earliest Safe Next Step:** Revisi PRD oleh Planner/PM (REVISE_PRD) + reviewer early review pada SLA pause decision.

**Register impact:** Temuan ini **memperkuat** audit-master-register V1 (SLA pause 3-way conflict, Catastrophe, needs-validation) sebagai blocker dominan untuk Snooze — tidak mengubah keputusan confirmed mana pun. Menambah requirement gap spesifik snooze (wake mechanism, idempotency, permission, isolation) sebagai prasyarat. Tidak menimpa source PRD. Jika register di-update, tambahkan pointer ke artifact ini.

**Reviewer handoff notes:** Semua finding P1 bersifat decision-level (bukan bug kode) — reviewer Gate A sebaiknya menilai apakah REVISE_PRD memadai atau feature perlu SPLIT (ship snooze tanpa integrasi SLA dulu). Fitur belum diimplementasi (no code to verify); traceability gap terbesar di wake idempotency & multi-tenant scoping.

---

## Change Log

| Date | Change | Author |
|---|---|---|
| 2026-09-02 | Initial assessment created | Analyst |
