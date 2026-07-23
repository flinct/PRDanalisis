# Assessment Report — Notification Recipient & Channel Expansion

- **Feature / Change**: Notification Recipient & Channel Expansion
- **Domain**: Cross-domain (Conversation, Ticket, Company & People, Notification)
- **Owner / Analyst**: Dany Christian
- **Reviewer**: Naftal Yunior
- **Assessment Date**: 2026-07-13
- **Related Artifact**: `Assessments/cross-domain/notification-recipient-channel-expansion/notification-recipient-channel-expansion-change-intake-brief.md`
- **Change Route**: `ROUTE_NEW_PRD`
- **Assessment Type**: Type 1 — New capability / cross-domain behavior expansion
- **Decision**: `PROCEED_WITH_CAUTION`

---

## 1. Executive Summary

Saat ini notification recipient untuk context conversation dan ticket masih berbasis company-wide fanout: semua member dalam company menerima notification yang terkait. Improvement yang diminta mengubah baseline ini menjadi recipient resolution berbasis role, assignment, team context, dan source channel coverage.

Perubahan ini bukan patch kecil. Blast radius menyentuh minimal empat area: event producer (conversation/ticket lifecycle), recipient resolver, notification preference/mandatory policy, dan audit/delivery observability. Selain itu, requirement juga menambah coverage source channel untuk item yang berasal dari Instagram, Messenger, WhatsApp, Widget, dan Email.

Requirement utama yang sudah cukup jelas dari change intake:

1. Assignee conversation/ticket wajib menerima notification.
2. Jika multiple assignee, notification dikirim ke semua assignee.
3. Untuk `new conversation` dan `new ticket`, notification tim wajib menjangkau minimal role SPV; terdapat indikasi Agent juga mandatory, tetapi scope pastinya masih perlu dikunci.
4. Jika round robin aktif, notification dikirim setelah assignee final ditentukan.
5. User preference diperbolehkan, kecuali recipient yang masuk mandatory class tidak boleh mematikan notification sesuai constraint role/policy.
6. Coverage berlaku untuk semua source channel: IG, Messenger, WhatsApp, Widget, Email.

Assessment menyimpulkan feature layak dilanjutkan, tetapi belum aman dibekukan ke PRD final tanpa mengunci beberapa keputusan struktural: definisi team scope, batas mandatory untuk Agent non-assignee, pemisahan source channel vs delivery channel, duplicate suppression, dan failure handling policy.

---

## 2. Problem Statement

### Current State

Notification untuk conversation/ticket hari ini dikirim ke semua member di company yang sama. Model ini sederhana, tetapi menghasilkan beberapa masalah:

- Noise tinggi karena user non-relevant tetap menerima notification.
- Tidak ada prioritas ownership; assignee tidak diperlakukan berbeda dari member biasa.
- SPV/team visibility tidak dibatasi oleh konteks tim atau object ownership.
- Potential duplicate/over-alert meningkat saat jumlah member company besar.
- Sulit menambahkan preference yang meaningful karena baseline terlalu broad.

### Target State

Notification perlu berubah dari company-wide membership fanout menjadi context-aware routing dengan prinsip:

- item owner / assignee wajib menerima notification,
- team supervisory role menerima team-intake signal untuk item baru,
- mandatory recipient tidak bisa di-suppress oleh user setting tertentu,
- notification tetap konsisten untuk semua source channel yang didukung,
- event yang bergantung pada assignment baru dieksekusi setelah recipient final benar-benar ter-resolve.

---

## 3. Requirement Intake Summary

### 3.1 Requirement Yang Sudah Terkunci dari User Input

1. **Current baseline**: recipient notif hari ini adalah semua member di company tersebut.
2. **Assignee mandatory**: semua member yang merupakan assignee di conversation atau ticket wajib menerima notif.
3. **New item team notification**: untuk `new conversation` dan `new ticket`, role SPV dan pihak relevan dari tim harus menerima notif.
4. **Multiple assignee**: semua assignee menerima notif.
5. **Round robin timing**: jika round robin `true`, notif dikirim setelah assignee ditentukan.
6. **Source channel coverage**: IG, Messenger, WhatsApp, Widget, Email.
7. **User config**: notification preference bisa dikonfigurasi user.
8. **Mandatory exception**: role Agent harus menerima notif dan tidak bisa disable notif.
9. **Backward behavior**: menyesuaikan kebutuhan improvement ini; existing behavior boleh berubah mengikuti routing baru.
10. **Fallback cross-channel**: belum diputuskan; perlu dijelaskan sebagai open question.

### 3.2 Requirement Yang Masih Ambigu

1. Apakah Agent mandatory berlaku untuk semua event atau hanya subset event.
2. Apakah Agent mandatory berlaku untuk semua Agent di company, Agent dalam team terkait, atau hanya Agent yang menjadi assignee.
3. Bagaimana definisi “tim” untuk notif `new conversation` / `new ticket`: queue, department, team inbox, company, atau kombinasi.
4. Apakah source channel coverage hanya mempengaruhi object eligibility, atau juga mengubah delivery channel notification ke user.
5. Apakah user preference bisa diatur per event, per source channel, per delivery channel, atau hanya global on/off.
6. Apakah recipient selain assignee/SPV/Agent tetap memiliki jalur receive notification untuk event tertentu.

---

## 4. Change Classification & Routing

### 4.1 Change Shape

Perubahan ini diklasifikasikan sebagai **new cross-domain capability** dengan behavior rewrite terhadap notification routing conversation/ticket, karena:

- belum ditemukan PRD notification routing dedicated yang menjadi source of truth,
- requirement menciptakan model recipient resolution baru,
- dampak tidak terbatas di satu domain,
- existing behavior company-wide fanout digantikan oleh logic yang lebih granular.

### 4.2 Route Recommendation

`ROUTE_NEW_PRD`

PRD baru dibutuhkan untuk mendefinisikan notification routing model secara eksplisit. Setelah itu, domain PRD Conversation V2 / Ticket V2 cukup direferensikan atau dipatch tipis pada section yang bergantung pada notification behavior.

### 4.3 Why Not Patch Existing PRD Only

Kalau requirement ini dipatch tersebar ke beberapa PRD domain tanpa parent PRD khusus, akan muncul risiko:

- rule recipient tidak sinkron antar domain,
- preference precedence tidak punya home utama,
- audit/logging dan failure handling tidak terdefinisi konsisten,
- QA sulit membuat traceability matrix karena behavior menyebar.

---

## 5. Scope Assessment

### 5.1 In Scope

1. Recipient resolution untuk notification conversation dan ticket.
2. Replacement company-wide fanout menjadi role/assignment/team-based routing.
3. Mandatory notification policy untuk assignee dan role tertentu.
4. Multiple-assignee fanout.
5. Round-robin post-assignment notification timing.
6. Source-channel coverage: IG, Messenger, WhatsApp, Widget, Email.
7. User notification preference dengan mandatory override.
8. Duplicate suppression per event per recipient.
9. Auditability: reason code, suppression reason, delivery result.

### 5.2 Out of Scope / Belum Terkunci

1. Cross-delivery-channel fallback otomatis.
2. Notification template/content redesign besar.
3. Escalation/SLA redesign.
4. External recipients di luar internal member/company user.
5. Generic custom notification rule builder.
6. Delivery-channel expansion ke media baru untuk end-user internal, kecuali nanti diputuskan eksplisit di PRD.

---

## 6. Functional Behavior Analysis

### 6.1 Recipient Model — Proposed Baseline

Assessment merekomendasikan baseline berikut sebagai starting point PRD:

1. **Assignee Mandatory Rule**
   - Jika user menjadi assignee conversation atau ticket, user wajib menerima notification untuk item tersebut.
   - Jika item memiliki multiple assignee, semua assignee menerima notification.

2. **New Item Team Visibility Rule**
   - Untuk event `new conversation` dan `new ticket`, minimal SPV dalam team/context relevan menerima notification.
   - Agent mandatory rule perlu dibatasi scope-nya agar tidak kembali menjadi broadcast terselubung.

3. **Company-wide Fanout Removal**
   - Semua member company tidak lagi otomatis receive notification conversation/ticket hanya karena berada dalam company yang sama.
   - Recipient harus lolos satu atau lebih condition routing yang eksplisit.

4. **Mandatory Override Rule**
   - Recipient dalam mandatory class tidak bisa disuppress oleh preference level user.
   - Preference hanya bekerja pada recipient yang tidak mandatory untuk event tersebut.

### 6.2 Event Timing — Round Robin

Input user sudah cukup jelas untuk satu hal penting: jika round robin aktif, notification yang berbasis assignment tidak boleh dikirim saat item baru tercipta bila assignee belum final. Notification harus menunggu hasil assignment final.

Implikasi:

- event pipeline perlu state “assignment resolved” atau equivalent hook,
- event `new conversation` / `new ticket` dan `assigned` bisa perlu dipisahkan,
- perlu dedupe agar user tidak menerima notif ganda dari creation + assignment pada momen yang hampir bersamaan.

### 6.3 Multiple Assignee

Rule locked: semua assignee menerima notif.

Ini sederhana, tetapi perlu guard:

- dedupe by userId bila user masuk lewat banyak reason,
- logging reason list per recipient,
- idempotency key per `(eventId, userId)`.

### 6.4 Source Channel Coverage

Scope channel yang disebut user: IG, Messenger, WhatsApp, Widget, Email.

Interpretasi paling aman saat ini: semua object conversation/ticket yang berasal dari source channel tersebut harus tunduk pada recipient policy yang sama, kecuali nanti PRD memutuskan ada per-channel exception.

Assessment belum merekomendasikan per-channel routing berbeda, karena belum ada requirement eksplisit yang cukup.

---

## 7. Preference & Policy Analysis

### 7.1 User Preference Capability

User menyatakan config seharusnya bisa dikonfigurasi oleh user. Itu berarti system harus menyediakan preference layer. Tetapi layer ini tidak boleh mengalahkan mandatory policy.

### 7.2 Minimum Precedence Hierarchy

Assessment merekomendasikan precedence ini di PRD:

1. **System hard rule / mandatory class**
2. **Role/team routing rule**
3. **User notification preference**
4. **Channel availability / delivery capability**

### 7.3 Mandatory Constraint

Locked:

- Role Agent harus menerima notif.
- Role Agent tidak bisa disable notif.

Tapi phrasing ini masih terlalu luas untuk langsung diimplementasikan. Jika dibaca literal sebagai “semua Agent di company receive semua notif”, hasilnya kembali mirip company-wide fanout pada company dengan banyak agent. Karena itu, assessment menandai ini sebagai salah satu open question paling kritikal: **scope Agent mandatory harus dikunci**.

---

## 8. Impact Analysis

### 8.1 Product / UX Impact

**High**

Perubahan langsung terasa di perilaku produk:

- siapa yang menerima notification berubah,
- potensi unread counters berubah,
- user expectation lama (“semua orang lihat notif”) tidak lagi berlaku,
- settings UI kemungkinan perlu ditambah/diubah untuk menjelaskan mandatory vs optional notification.

### 8.2 Backend / Domain Logic Impact

**High**

Area yang kemungkinan terdampak:

- event producer conversation/ticket,
- assignment resolver / round robin hook,
- notification recipient resolver,
- preference evaluator,
- dedupe/idempotency layer,
- audit/delivery logging,
- permission/RBAC filter sebelum send.

### 8.3 Frontend Impact

**Medium to High**

Kemungkinan kebutuhan FE:

- preference settings UI,
- mandatory lock state pada role/event tertentu,
- recipient explanation text / tooltip,
- unread badge behavior update,
- notification center filtering/state reconciliation.

### 8.4 QA / Regression Impact

**High**

Regression surface besar karena menyentuh:

- conversation creation,
- ticket creation,
- assignment flows,
- round robin,
- multi assignee,
- RBAC visibility,
- notification counters,
- per-channel source flows.

### 8.5 Data / Migration Impact

**Medium**

Jika existing user preference schema belum mengenal mandatory/non-disable path, migration diperlukan. Jika schema sudah ada tetapi global בלבד, perlu extension untuk rule granularity. Behavior rollout tanpa migration policy berisiko membingungkan user existing.

---

## 9. Risk Analysis

### 9.1 High Risks

#### R1. Agent Mandatory Diartikan Terlalu Broad
Jika semua Agent di company receive semua event, requirement gagal mengurangi noise dan malah mempertahankan blast radius besar.

**Mitigasi**: PRD wajib mendefinisikan scope Agent mandatory secara sempit dan contextual.

#### R2. Duplicate Notification dari Multi-Reason Resolution
User bisa qualify sebagai assignee + SPV + Agent.

**Mitigasi**: dedupe per event per user, tetapi simpan semua inclusion reason di audit log.

#### R3. Race Condition pada Round Robin / Assignment Finalization
Jika notification dikirim sebelum assignee final stabil, recipient salah bisa menerima notif.

**Mitigasi**: event gating pasca-assignment, idempotency key, dan final-state check.

#### R4. Permission Leak
User yang match role/team tetapi tidak punya access ke object bisa menerima notif yang seharusnya tidak terlihat.

**Mitigasi**: filter recipient dengan permission check final sebelum delivery.

### 9.2 Medium Risks

#### R5. SPV Multi-Team Over-Notification
SPV yang cover banyak team bisa menerima volume sangat tinggi.

**Mitigasi**: kunci definisi team scope dan pertimbangkan preference untuk optional tier.

#### R6. Inconsistent Channel Treatment
Jika tiap source channel diperlakukan beda tanpa aturan eksplisit, behavior user sulit diprediksi.

**Mitigasi**: default satu matrix lintas source channel, exception harus eksplisit di PRD.

#### R7. Settings UX Confusion
User bisa bingung kenapa beberapa toggle tidak bisa dimatikan.

**Mitigasi**: tampilkan lock reason pada UI preference.

---

## 10. QA Assessment

### 10.1 Test Surface Utama

1. New conversation notification.
2. New ticket notification.
3. Conversation assignment notification.
4. Ticket assignment notification.
5. Round robin assignment timing.
6. Multiple assignee fanout.
7. Dedup when one user matches multiple recipient reasons.
8. Mandatory rule bypassing disabled user preference.
9. Source-channel parity for IG, Messenger, WhatsApp, Widget, Email.
10. Permission/RBAC suppression.

### 10.2 Regression Areas

- notification center list,
- unread badge/counter,
- assignee change events,
- queue/team routing behavior,
- role-based access alignment,
- existing notification preference behavior.

### 10.3 Automation Candidate

High-value automation candidate:

1. Recipient matrix tests for event × role × assignee state.
2. Round-robin post-assignment timing tests.
3. Multi-assignee dedupe tests.
4. Mandatory preference override tests.
5. Source-channel parity suite.

---

## 11. Recommended PRD Structure

Assessment merekomendasikan PRD nanti minimal punya section berikut:

1. Objective & problem statement.
2. Definitions: recipient, mandatory recipient, optional recipient, team, assignee, source channel.
3. Event catalogue.
4. Recipient resolution rules.
5. Event × recipient matrix.
6. Preference precedence hierarchy.
7. Multiple-assignee & dedupe rules.
8. Round-robin timing rules.
9. Source-channel parity / exception rules.
10. Permission filter rules.
11. Audit, logging, and observability requirements.
12. Migration / rollout behavior.
13. Open questions and deferred decisions.

---

## 12. Open Questions for BRD / PRD

Berikut open questions yang perlu ditulis lengkap agar bisa dibahas lebih lanjut dengan stakeholder.

### OQ-01 — Scope Mandatory untuk Agent
Apakah “Role Agent harus menerima notif dan tidak bisa disable notif” berarti:

1. semua Agent di company menerima semua notification conversation/ticket,
2. semua Agent di team yang relevan menerima `new conversation` dan `new ticket`, atau
3. Agent hanya mandatory jika menjadi assignee / masuk routing relevan lain.

Ini adalah open question paling kritikal karena paling besar mengubah blast radius recipient.

### OQ-02 — Definisi “Tim”
“Notif dari tim” didefinisikan berdasarkan apa:

- queue,
- department,
- team inbox,
- company,
- atau kombinasi beberapa atribut.

Perlu juga dijawab bagaimana behavior untuk user yang tergabung dalam banyak tim.

### OQ-03 — Recipient Set untuk `new conversation` dan `new ticket`
Selain SPV dan kemungkinan Agent, apakah ada role lain yang wajib / optional receive, misalnya Admin atau watcher tertentu.

### OQ-04 — User Preference Granularity
User config boleh mengatur apa saja:

- per event,
- per source channel,
- per delivery channel,
- global on/off,
- quiet hours,
- only-mention / only-assigned mode.

### OQ-05 — Source Channel vs Delivery Channel
Saat user menyebut “semua channel (IG, Messenger, WhatsApp, Widget, Email)”, apakah yang dimaksud hanya source channel conversation/ticket, atau sekaligus delivery channel notifikasi ke internal user.

### OQ-06 — Cross-Channel Failure Handling
Jika delivery lewat satu channel gagal, apakah perlu fallback ke channel lain atau cukup dicatat sebagai failed delivery.

### OQ-07 — Final Recipient Snapshot Timing
Apakah recipient di-resolve sekali saat event terjadi, atau dievaluasi ulang mendekati waktu send jika role/team membership berubah sangat cepat.

### OQ-08 — Dedupe Scope
Jika satu user match banyak reason pada event yang sama, dedupe jelas diperlukan. Tetapi apakah event yang sangat berdekatan, misalnya `new conversation` dan `assigned`, perlu di-coalesce menjadi satu notifikasi atau tetap dua notifikasi terpisah.

### OQ-09 — Old Assignee Behavior
Jika assignment pindah dari A ke B, apakah old assignee perlu notifikasi kehilangan assignment, atau hanya new assignee yang receive notifikasi.

### OQ-10 — Permission Gate
Apakah recipient yang lolos role/team rule tetapi tidak punya access object tetap harus disuppress total. Rekomendasi assessment: ya, harus disuppress.

### OQ-11 — Migration / Rollout Strategy
Apakah perubahan dari company-wide fanout ke routing baru dilakukan sekaligus, bertahap per company, atau di-guard oleh feature flag.

### OQ-12 — UI Lock Explanation
Bagaimana settings UI menjelaskan bahwa beberapa notification tidak bisa disable karena mandatory policy.

### OQ-13 — Audit Retention & Delivery Log Detail
Berapa lama notification audit disimpan, field apa saja yang wajib dicatat, dan apakah delivery retry history harus disimpan penuh.

---

## 13. Recommendation

### Decision
`PROCEED_WITH_CAUTION`

### Rationale

Feature ini solve pain yang nyata dan sejalan dengan kebutuhan scaling notification quality. Namun requirement saat ini belum cukup presisi untuk langsung dibekukan menjadi implementation-ready PRD. Ada beberapa ambiguity yang jika salah tafsir akan menghasilkan salah satu dari dua kegagalan besar:

1. notif tetap terlalu broad dan spammy, atau
2. notif terlalu sempit dan menghilangkan visibility operasional.

### Minimum Preconditions Sebelum PRD Freeze

1. Kunci scope Agent mandatory.
2. Definisikan arti “tim”.
3. Pisahkan source channel vs delivery channel bila memang dua hal berbeda.
4. Kunci dedupe policy untuk event berdekatan.
5. Kunci permission gate dan migration behavior.

---

## 14. Proposed Next Step

1. Gunakan assessment ini sebagai bahan stakeholder review.
2. Buka pembahasan khusus untuk OQ-01, OQ-02, dan OQ-05 karena itu penentu design utama.
3. Setelah open question kritikal terjawab, tulis PRD baru notification routing.
4. Patch domain PRD Conversation V2 / Ticket V2 hanya pada bagian yang perlu mereferensikan behavior notification baru.
5. Lanjut ke QA pre-implementation review setelah PRD freeze.

---

## 15. Summary Verdict

Perubahan ini valid, penting, dan layak diteruskan. Tetapi karena menyentuh recipient identity, team semantics, mandatory policy, dan assignment timing, perubahan harus diperlakukan sebagai cross-domain design change, bukan sekadar tweak konfigurasi notif. Dengan kondisi sekarang, keputusan terbaik adalah **lanjut, tapi dengan kehati-hatian dan dengan open questions eksplisit di BRD/PRD**.
