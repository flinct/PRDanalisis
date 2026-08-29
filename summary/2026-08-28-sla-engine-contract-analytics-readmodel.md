# Summary — SLA Engine Contract & Analytics Read Model Deep-Dive

**Tanggal:** 2026-08-28
**Domain:** Conversation V2 × Ticket V2 × Analytics (SLA)
**Tipe:** Brainstorm + analisa arah development (fix-flow > new-module)
**Status:** Brainstorm — belum decision-bearing. 1 draft PRD ditulis (masih perlu revisi besar per temuan akhir).

---

## Konteks / Tujuan

Lanjutan fase deep-dive Conversation V2 → fokus **SLA fragmentasi (L1)** → brainstorm restrukturisasi SLA jadi 3 jenis + gimana ditampilkan di Statistic + apakah data pengambilannya best-practice.

Prinsip: **fix flow > new module.** Modul/section baru hanya kalau market signal eksplisit.

---

## Alur Diskusi (kronologis)

1. **Tulis draft PRD SLA Engine Contract** → `PRD/Conversationv2/PRD - SLA Engine Contract (Conversation x Ticket).md` (draft awal, sebelum semua koreksi di bawah — PERLU REVISI).
2. **Behaviour SLA Conversation vs Ticket** → Conversation cukup 2 primitif (participant join + message). Ticket butuh 4 primitif (created, assignee set, message, status/stage transition) karena ticket = state machine, kadang tanpa pesan sama sekali.
3. **FRT Ticket message-driven tepat?** → Formula benar (message-driven completion), TAPI **gap: ticket resolve tanpa pernah ada pesan → FRT zombie (running/breach selamanya)**. Fix: status `not_applicable` saat ticket Resolved & FRT belum completed. TTC & Stage SLA aman (status-driven murni). Ini instance konkret dari Finding 5 (Metric Status enum belum ada).
4. **Usulan 3-jenis SLA** (SLA Member / Conversation / Ticket, share SLA setting, metric terpisah) → dianalisa: bukan modul baru, tapi 3 lensa (group-by) dari data sama.
5. **Tampilan di Statistic** → awalnya usul 3-tab baru + card compliance rate + Member leaderboard.
6. **KOREKSI 1:** `ManageStatisticPage.tsx` sudah punya **6 section**: conversations, ticket, broadcast, responsiveness, **member-performance**, offline-report. SLA Member = `member-performance` SUDAH ADA. Usulan "bangun Member SLA baru" = batal.
7. **KOREKSI 2 (data source):** analytics collections aktual = `agentperformancemetrics`, `broadcastdailymetrics`, `conversationdailymetrics`, `offlinereportjobs`, `responsivenessmetrics`, `ticketdailymetrics`.
8. **KOREKSI 3 (schema `responsivenessmetrics`):** discriminator `metricType` SUDAH ADA (`conversation_art`, `ticket_art`, + frt/ttc). Grain = daily. Field = `avg/sum/count`, per agent/team/company. Read model arsitektur SUDAH best-practice (skenario B berlapis, bukan A independen).

---

## Temuan Final (root cause "belum best-practice")

**Bukan** arsitektur (read model + discriminator sudah benar, conversation vs ticket sudah terpisah via `metricType`).

**Root cause:** schema `responsivenessmetrics` cuma simpan `avg/sum/count` → **nggak bisa hitung compliance rate, median, breach count, atau exclude not_applicable.** Avg saja nggak actionable (avg 4.4m tapi nggak tahu % on-time). 3-jenis SLA nggak bisa jalan tanpa compliance rate.

---

## Fix Minimal (ponytail — reuse existing, 0 collection baru)

Tambah 3 field ke `responsivenessmetrics`:
```
+ metCount: Number    (value ≤ SLA threshold)
+ breachCount: Number (value > SLA threshold)
+ naCount: Number     (not_applicable, excluded dari avg/sum/count)
```
Lalu:
- Compliance rate = `metCount / count × 100%`
- Threshold: snapshot dari SLA Settings saat aggregation (bukan realtime query) — ini yang bikin 3-jenis SLA share setting.
- `not_applicable` trigger: ticket resolve tanpa reply → `naCount`, exclude dari avg. Butuh event dari ticket-service.
- **VERIFIKASI:** `agentperformancemetrics` rollup FROM `responsivenessmetrics` atau hitung independen? Kalau independen = divergensi definisi (L1 lagi).

Median = YAGNI fase ini (compliance + avg cukup). Upgrade path: field p50/histogram bucket kalau diminta.

---

## Behaviour SLA per Domain (locked di diskusi)

**Conversation** (2 primitif: join + message):
- FRT = `firstReply − firstCustomerMsg` (dari inbound, BUKAN assignment — cegah FRT≡RLT)
- RLT = `firstReply − firstAssignment` (PERSISTED)
- Wait Time = `firstAssignment − firstCustomerMsg` (PERSISTED)
- TTC = `closedAt − firstCustomerMsg`

**Ticket** (4 primitif: created, assignee set, message, status/stage):
- FRT = `firstReply − ticketCreatedAt` → **`not_applicable` kalau resolve tanpa reply**
- TTC = `resolvedAt − ticketCreatedAt` (status-driven, aman)
- Stage SLA = cumulative time-in-stage (aman)
- **GAP: Ticket nggak punya RLT-nya sendiri.** Manual ticket (no linked conversation) = blind spot. Usul: "Ticket Handling Time" = `firstReply − assigneeSetAt`, berlaku semua ticket. Belum di-lock.

**Member** (aggregate lens):
- Compliance rate (primary) + avg/median (secondary), rollup dari conversation+ticket instance.
- Credit: first responder utk FRT/RLT, resolver utk TTC, assignee utk Wait Time.
- `#Handled` (volume) WAJIB tampil — compliance rate tanpa denominator = misleading.
- RBAC: agent lihat data sendiri, supervisor lihat tim, admin lihat semua (data performa = sensitif).

---

## Warna/Threshold (jangan dicampur)

- **Chat List** SLA color = budget tersisa per-item (PRD US-14: >50%/≤50%&>10%/≤10%). FE sekarang pakai absolute time = **BUG live**, harus fix ke persentase.
- **Statistic** card = compliance rate agregat (≥90% green / 70-90% yellow / <70% red).
- Dua konteks warna BEDA semantik — tulis eksplisit di PRD, jangan reuse token sembarangan.

---

## Status Artifact

| Artifact | Status |
|---|---|
| `PRD/Conversationv2/PRD - SLA Engine Contract (Conversation x Ticket).md` | Draft awal ditulis, **PERLU REVISI** (belum masukkan: not_applicable, read model 3-field, koreksi member-performance existing) |
| §5.7 Analytics Read Model Contract | Belum ditulis ke PRD (masih di chat) |
| Summary ini | ✅ |

---

## Next Actions (belum dikerjakan)

1. Revisi PRD SLA Engine Contract: masukkan FRT `not_applicable`, §5.7 read model (3 field + pipeline contract), koreksi "member-performance existing bukan bangun baru".
2. Verifikasi `agentperformancemetrics` schema — rollup atau independen hitung.
3. Verifikasi metricType Wait Time (`conversation_wt`/`ticket_wt`) ada di responsivenessmetrics atau tidak.
4. Lock keputusan "Ticket Handling Time" (RLT untuk ticket manual) — build atau skip.

---

## Update 2026-08-28 (sesi 2) — Full-Stack SLA Reference

Dibuat reference lengkap seluruh sistem SLA (5 lapis) atas permintaan user ("analisa seluruh SLA sistem ... jadikan referensi"):
→ `Assessments/reference/sla-system-full-analysis.md` (registered di `Memory/reference-index.md`).

Cakupan: LAPIS 1 Setting (conv per-channel vs ticket per-type, tabel beda kritis), LAPIS 2 Conversation apply (timing chain 5 metric + formula code-verified + pause policy), LAPIS 3 Ticket apply (FRT zombie gap, no-RLT gap), LAPIS 4 Member calc (credit attribution + G-06 rollup-vs-independen belum verified), LAPIS 5 Statistic (6 section, responsivenessmetrics, cron 3-jam, CSAT+SLA-breakdown Redash path, root cause + fix 3-field, SLASettingMetricEnum gating). Plus §6 dua konteks warna, §7 konsolidasi 12 gap/konflik (G-01..06, C-01..06).

Sumber baru yang dibaca sesi ini: `PRD Conversation SLA.md` v2.0, `PRD Ticket - SLA ticket.md` v1.0, `conversation-sla-rlt-frt-ttc-analysis.md`, `sla-conversation-ticket.md`, Patch 4 brief, metric-aggregation-architecture ref.

---

## Blocking Decisions (dari draft PRD, belum dijawab PM)

DECISION-A (reopen new-cycle vs resume), DECISION-B (pause policy Hold/Snooze/AUX), DECISION-C (RLT inherit ke N ticket), DECISION-D (move freeze/reset), DECISION-E (reassign Wait Time), DECISION-F (macro/bulk/email count first reply?), DECISION-G (Chat List color basis FRT/TTC).
