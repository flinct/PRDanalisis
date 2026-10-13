# Change Intake Brief: WhatsApp Baileys History Sync

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** User chat request (2026-10-13) — "satuinbox mau buat history sync function" untuk WhatsApp (Baileys)
> **Artifact Path:** `Assessments/whatsapp-web/history-sync/history-sync-change-intake-brief.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/core/change-management.md`, `Rules/core/task-router.md`, `Rules/core/analysis-and-risk.md`
> **Supporting Context:** `Memory/global-memory.md`, `incident report/2026-07-20-pk12-10-rmq-sync-history-saturation.md`, Baileys docs (baileys.wiki/advanced/history-sync), Baileys issue #2452
> **Tanggal Intake:** 2026-10-13
> **Status:** Scoped — Ready for discovery lock (HOLD on technical contracts)

---

## 0. Ringkasan Update Brief

- Initial version. Mengkaji request fitur History Sync WhatsApp berbasis Baileys.
- Mengunci realita teknis Baileys: **tidak ada API sync by-date / by-range**. Hanya ada (1) initial history sync saat connect, (2) on-demand sync `fetchMessageHistory` (pagination mundur dari anchor), (3) incremental/live saat reconnect.
- Mengangkat **incident SEV-1 2026-07-20** sebagai protected-behavior constraint utama: fitur ini persis yang menyebabkan outage total.
- Routing: **HOLD_NEEDS_DISCOVERY** — scope jelas, tapi 7 technical contract wajib dikunci sebelum PRD.

---

## 1. Request Snapshot

**Request Summary:**
SatuInbox ingin membangun fungsi History Sync untuk channel WhatsApp (Baileys), dengan tiga mode yang dibayangkan user:
1. **Sync history today** — ambil pesan hari ini.
2. **Sync older message** — dari pesan terlama hari ini mundur hingga 500 pesan lebih lama.
3. **Sync unread / gap** — contoh: last read Jumat; pesan inbound masuk Sabtu & Minggu; user buka SatuInbox Senin → sistem harus sync history hari ini (Senin) **dan** semua pesan Sabtu + Minggu.

**Business Problem:**
Saat agent/company membuka SatuInbox, konteks percakapan WhatsApp sebelumnya (dan pesan yang masuk saat device/agent offline) tidak tampil lengkap. Agent kehilangan konteks historis dan berpotensi melewatkan pesan yang masuk selama periode offline.

**Target User / Role / Stakeholder:**
Agent, Supervisor, Admin (semua yang membaca percakapan WA). Trigger onboarding: company baru yang baru scan nomor WA.

**Expected Outcome:**
Percakapan WA historis + pesan yang masuk saat offline tersedia di SatuInbox, tanpa men-degradasi performa realtime existing (zero-tolerance perf — standing constraint user).

**Urgency / Why Now:**
Belum ada evidence demand level L3/L4 eksplisit di request. Catatan: fitur serupa (sync history saat scan) **sudah pernah jalan tanpa guard** dan menyebabkan outage SEV-1 (2026-07-20). Jadi ini sebagian **remediation** dari behavior yang sudah ada, bukan murni fitur baru.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `MIXED_REQUEST` — `NEW_FEATURE` (mode UI on-demand + gap sync) + `BEHAVIOR_CHANGE` (memperbaiki/menata ulang history ingest yang sudah ada & bermasalah) |
| Primary Domain | WhatsApp Web (Baileys) — cross-domain ke Conversation (ingest pipeline, counter, assignment, socket) |
| Request Shape | Add + Change |
| Initial Complexity Signal | **Critical** |
| Needs Split? | **Yes** (lihat §6) |

### Classification Rationale
- Bukan sekadar fitur baru: SatuInbox **sudah** memproses history sync saat scan channel, lewat pipeline inbound realtime yang sama (`inbound-message.processor.ts`). Behavior itu menyebabkan outage total SEV-1. Jadi request ini otomatis menyentuh **remediation of existing behavior**, bukan greenfield.
- Blast radius = seluruh tenant & seluruh channel inbound (bukan hanya WA tenant terkait), terbukti di incident 2026-07-20. Maka klasifikasi **Critical** dan governed lane non-bypassable.

### Demand Screen (dari change-management.md)
| Level | Penilaian | Catatan |
|---|---|---|
| Demand | Belum terverifikasi eksplisit L3/L4 | Request datang dari internal/PM, bukan dari user workflow blocker terdokumentasi. **Namun** sisi remediation (RC-A/RC-B incident) adalah L4 setara (revenue/retention blocker: outage total). |

Kesimpulan demand: sisi **remediation = prioritas tinggi (outage prevention)**; sisi **fitur UI on-demand sync = perlu konfirmasi demand** sebelum full PRD.

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | Tidak ada PRD khusus "History Sync". Terkait: `PRD/Whatsapp web v2/PRD WA Web Anti Spam System*.md`, `PRD WA Web Account Channel Event Log.md`, `PRD WA Web Outbound Anti-Ban Guard.md` |
| PRD status | Not found (untuk History Sync sebagai fitur bernama) |
| PRD treatment candidate | New PRD (fitur) + Patch/addendum ke pipeline ingest Conversation (remediation) |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| BE | **Partial / Shipped (bermasalah)** — history sync saat scan channel sudah berjalan, diproses sebagai inbound realtime via `inbound-message.processor.ts`, TANPA fast-path, TANPA queue terpisah, TANPA throttle | `incident report/2026-07-20-pk12-10-rmq-sync-history-saturation.md` §4–§5; `apps/conversation-service/src/app/processors/inbound-message.processor.ts:280-330, 452-467, 879-892`; `channel-service` sync publisher |
| BE | On-demand `fetchMessageHistory` belum dikonfirmasi diimplementasi di SatuInbox | Perlu verifikasi di BE repo |
| FE | Belum ada UI sync mode (today / older / unread) | Perlu verifikasi di FE repo |
| Runtime / Current Behavior | Scan 6 nomor → 12.886 conversation + 144k+ message dalam ~1.5 jam → RMQ shared-queue saturation → SatuInbox blank total, semua channel inbound stop, recovery butuh RMQ restart manual | Incident report §1–§6 |

### 3.3 Related Sources
- `incident report/2026-07-20-pk12-10-rmq-sync-history-saturation.md` — **root cause & action items (B1–B10) untuk history sync**; paling relevan.
- `incident report/2026-07-20-1000-conversation-event-storm.md` — amplifier (RC-1..RC-6 socket/FE).
- `summary/2026-07-20-conversation-loading-spike-analysis.md`.
- `Memory/global-memory.md` — zero-tolerance perf, SLA/counter accuracy.
- Baileys docs — kemampuan & limitasi teknis history sync (lihat §5 brief ini).

---

## 4. Scope Boundary

### 4.1 In Scope
- **Mode A — Sync today**: tampilkan pesan hari ini (filter lokal dari data yang masuk + live stream). *Catatan: "today" bukan request API terpisah — WA tidak punya by-date API.*
- **Mode B — Sync older (pagination)**: on-demand `fetchMessageHistory` mundur dari anchor message terlama yang sudah tersimpan, loop batch sampai target (mis. 500 lebih lama) atau habis.
- **Mode C — Gap / unread sync**: pesan yang masuk saat device/agent offline. **Jalur teknis berbeda** dari Mode B (datang via reconnect/incremental, bukan `fetchMessageHistory`).
- **Remediation ingest**: pemisahan queue sync vs realtime, fast-path processor (`isHistorySync`), rate-limit publisher, backpressure/circuit breaker, dedup by `message.key.id`. (Incident action items B3–B6.)

### 4.2 Out of Scope
- Full-history sync (`syncFullHistory:true` + macOS preset) sebagai default — terlalu berat; hanya opsi eksplisit bila diputuskan.
- Sync media file lama secara agresif (pointer bisa expired; teks tetap diprioritaskan).
- History sync untuk channel non-WA / non-Baileys (IG/FB/email) — API berbeda.
- Per-tenant queue isolation penuh (long-term, bukan phase 1).

### 4.3 Protected Existing Behavior (NON-NEGOTIABLE)
- **Realtime inbound pipeline semua tenant & semua channel TIDAK BOLEH ter-block oleh sync.** Ini akar outage SEV-1 2026-07-20. History sync wajib di jalur/queue terpisah dengan prioritas lebih rendah.
- **Counter accuracy** (`COUNTER_INBOUND`) tidak boleh tercemar oleh message historis (RC-E).
- **Auto-pull / assignment** tidak boleh ter-trigger per message historis (RC-D) — agent inbox tidak boleh kebanjiran 12k+ assignment.
- **Socket emit** tidak boleh per-message historis (RC-F) — gunakan 1 event batch-complete.
- **SLA / RLT / FRT / TTC** tidak boleh terhitung dari timestamp historis.
- **Ticket sync** tidak di-trigger untuk message historis (kecuali diputuskan eksplisit).

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | **Yes** | Conversation create/update, message save, participants assignment, counter, SLA metric |
| RBAC / visibility / assignment | **Yes** | Auto-pull assignment untuk historis = salah; siapa boleh trigger sync (agent/supervisor/admin) belum dikunci |
| API / webhook / socket / queue / cron | **Yes** | RMQ queue (shared → harus split), socket emit volume, auto-pull cron, channel-service publisher, api-gateway dual fanout |
| SLA / reporting / export | **Yes** | Counter & SLA pencemaran dari timestamp historis |
| Migration / rollback / feature flag | **Yes** | Butuh feature flag `isHistorySync`, backfill policy, rollback bila sync liar |
| Existing regression scope | **Yes** | Seluruh inbound realtime path (semua tenant), counter, assignment, socket storm, FE invalidation |

### Early Blast-Radius Notes
- **Reproduksi outage adalah risiko nyata, bukan hipotesis.** Incident 2026-07-20 sudah membuktikan fitur ini (dalam bentuk existing) mematikan sistem total. Setiap desain PRD wajib lulus guard incident action-items B3–B6 sebelum GO.
- Baileys on-demand (`fetchMessageHistory`) **bisa di-drop diam-diam oleh WA** untuk companion device (issue #2452): kirim sukses, dapat `sessionId`, tapi `messaging-history.set` tidak pernah fire → butuh timeout + retry + dead-letter, jangan tunggu selamanya.
- Baileys **butuh HP utama online** sebagai sumber history; device mati → sync older gagal total → butuh state "sync unavailable".
- **Anchor dependency**: `fetchMessageHistory` butuh `oldestMsgKey` + timestamp dari pesan yang sudah ada; chat kosong tanpa anchor → tidak bisa fetch.

### Realita Teknis Baileys (dasar scoping — WAJIB dibaca downstream)
1. **Tidak ada API by-date / by-range.** Hanya: initial sync (volume ditentukan browser preset, fixed) + on-demand pagination mundur dari anchor + incremental/live saat reconnect.
2. Mode "today" = filter lokal atas data yang sudah masuk, bukan request terpisah.
3. Mode "older 500" = **loop** `fetchMessageHistory(count, oldestKey, oldestTs)`; tiap batch update anchor ke pesan terlama batch, ulang sampai target/habis.
4. Mode "unread Sabtu+Minggu" = **reconnect/incremental replay**, BUKAN `fetchMessageHistory` (fetch hanya ambil *lebih lama* dari anchor, bukan gap di tengah). Dua jalur berbeda — jangan disatukan logic-nya.
5. On-demand async & unreliable (issue #2452) — timeout/retry/DLQ wajib.
6. Media lama bisa expired di server WA — teks tetap, file bisa hilang.
7. Rate limit WA — spam `fetchMessageHistory` berisiko throttle/ban nomor → butuh backoff + cap per window.
8. Timestamp WA = epoch UTC — "today" harus dihitung per timezone company/agent.
9. Multi-tenant fan-out (20 microservices) — sync wajib async job, bukan di request path.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | **`HOLD_NEEDS_DISCOVERY`** → lalu `SPLIT_REQUEST` |
| Recommended Next Rules | `Rules/core/analysis-and-risk.md`, `Rules/core/requirements.md`, `Rules/core/test-design.md` |
| Recommended Next Artifact | Assessment Report (decision-bearing) sudah dibuat bersama brief ini → lalu PRD per sub-scope setelah OQ terkunci |
| Can Proceed to PRD? | **No** — kunci 7 technical contract (§7) dulu |

### Routing Rationale
- Request valid dan evidence-backed, tapi menyentuh pipeline yang terbukti catastrophic. Tidak boleh langsung PRD tanpa mengunci contract ingest (queue split, fast-path, throttle, backpressure) + contract Baileys (anchor, timeout/retry, reconnect gap).
- **SPLIT_REQUEST** disarankan karena objektif & delivery path berbeda:
  - **Sub-A (P0, remediation):** Ingest hardening — queue split + fast-path + throttle + backpressure + dedup. (Incident B3–B6.) Harus duluan; ini yang mencegah outage berulang.
  - **Sub-B (P1, fitur):** On-demand sync UI (Mode A today + Mode B older pagination) di atas pipeline yang sudah aman.
  - **Sub-C (P1/P2, fitur):** Gap / unread reconnect sync (Mode C) — jalur reconnect, desain terpisah.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | **Queue architecture**: konfirmasi apakah sync & realtime benar 1 queue; desain split final (routing key, prefetch, consumer count). | Akar outage SEV-1. Tanpa split, fitur ini mengulang outage. | **Yes** | BE + DevOps |
| OQ-02 | **Fast-path contract**: definisi flag `isHistorySync`, hook mana yang di-skip (auto-pull, counter, socket, ticket sync) dan apa penggantinya (bulk counter, batch-complete event). | Menentukan beban per-message historis & kebenaran counter/SLA. | **Yes** | BE + Architecture |
| OQ-03 | **Sync design intent**: history masuk sebagai "inbound message" (trigger notif/assignment) atau jalur "arsip/read-only import"? | Menentukan RC-D fix cukup flag vs butuh separate service. (Incident OQ#7.) | **Yes** | PM + Architecture |
| OQ-04 | **Mode B target semantics**: "500 older" = per chat? per channel? per company? Batch size & cap per window. | Volume = 500 × N chat × M channel bisa meledak. Rate-limit & storage. | **Yes** | PM + BE |
| OQ-05 | **Mode C (gap) mechanism**: apakah pesan offline Sabtu–Minggu memang datang via reconnect/incremental di stack ini, dan apakah tersimpan? Perlu verifikasi `messaging-history.set` syncType handling. | Kalau tidak di-handle, pesan offline hilang; kalau diproses via pipeline lama, outage lagi. | **Yes** | BE |
| OQ-06 | **On-demand reliability**: timeout, retry count, backoff, dead-letter untuk `fetchMessageHistory` yang di-drop WA (issue #2452). | Tanpa ini, sync menggantung tanpa feedback ke user. | **Yes** | BE |
| OQ-07 | **Trigger & RBAC**: siapa boleh trigger sync (agent/supervisor/admin), per-chat atau per-channel, manual atau otomatis saat open. Rate-limit per user. | Mencegah abuse & ban WA; menentukan UI & permission. | **Yes** | PM + BE |
| OQ-08 | **Media policy**: sync media historis atau teks saja? Handling media expired. | Storage cost & UX. | No | PM |
| OQ-09 | **Demand confirmation** untuk Sub-B/Sub-C (fitur on-demand UI). | Demand screen belum L3/L4 terverifikasi untuk sisi fitur. | No | PM |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst (Dany Christian) | Scope lock + demand confirmation | Pending | Owner brief |
| Engineering Lead (Naftal Yunior) | Technical direction (queue split, fast-path, Baileys contract) | Pending | |
| DevOps | RMQ queue definition audit + split deploy | Pending | Incident B1/B3 |
| Architecture | Sync intent (inbound vs arsip), separate service decision | Pending | OQ-03 |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| Assessment Report | `Assessments/whatsapp-web/history-sync/history-sync-assessment.md` | scope, change class, baseline, protected behavior, routing rationale |
| PRD Sub-A (Ingest Hardening) | `PRD/Whatsapp web v2/History Sync/PRD WA Web - History Sync Ingest Hardening.md` (TBD) | protected behavior, incident constraints, OQ-01/02/03 |
| PRD Sub-B (On-demand UI) | `PRD/Whatsapp web v2/History Sync/PRD WA Web - On-Demand History Sync.md` (TBD) | Mode A/B scope, Baileys limits, OQ-04/06/07 |
| PRD Sub-C (Gap/Unread) | `PRD/Whatsapp web v2/History Sync/PRD WA Web - Offline Gap Sync.md` (TBD) | Mode C mechanism, OQ-05 |
| QA Pre-Implementation Review | `Assessments/whatsapp-web/history-sync/...` | impact flags, protected behavior, regression scope (full inbound path) |
| Automation Mapping / Test Spec | `Test/whatsapp-web/...` | traceability + non-scope guard |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-10-13 | Initial brief created. Baileys technical reality locked; incident 2026-07-20 set as protected-behavior constraint; routed HOLD_NEEDS_DISCOVERY → SPLIT_REQUEST (Sub-A ingest hardening P0, Sub-B on-demand UI, Sub-C gap sync). 9 open questions, 7 blocking. | Dany Christian (PM) |
