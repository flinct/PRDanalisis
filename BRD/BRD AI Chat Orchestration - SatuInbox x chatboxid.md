# Business Requirement Document (BRD)

**Feature / Initiative**: AI Chat Orchestration — SatuInbox x chatbox.id  
**Version**: v0.1  
**Status**: Draft  
**Author**: Hermes  
**Date**: 2026-07-01  
**Source Change Intake Brief**: `Assessments/cross-domain/ai-chat-ai-assist-layer/ai-chat-ai-assist-layer-change-intake-brief.md` (v1.2)

**Prototype:** `/tmp/ai-chat-orchestration-prototype.html`

---

## 0\. Update Summary

*   v0.1 initial BRD draft created from Change Intake Brief v1.2.
*   Uses real CS cases from `Downloads/Case CS - Sheet1.tsv` as operational baseline.
*   Open questions retained as notes; document is business-framing draft, not dev-ready specification.

---

## 1\. Background

Saat ini SatuInbox sudah berperan sebagai front layer percakapan customer melalui channel yang dimiliki platform. Namun jawaban customer service masih banyak bergantung pada human agent, sementara sebagian use case nyata menunjukkan pola berulang: ada pertanyaan yang bisa dijawab langsung, ada yang perlu makro edukasi, ada yang perlu minta data tambahan, dan ada yang harus diteruskan ke divisi tertentu.

Perusahaan sudah memiliki platform `chatbox.id` yang berfungsi sebagai penyedia layanan agent AI. Rencana bisnisnya adalah menjadikan SatuInbox sebagai layer depan yang tetap dilihat customer, sementara `chatbox.id` menjadi mesin AI di belakang layar melalui integrasi MCP. Bila dibutuhkan data tambahan, `chatbox.id` dapat mengambil data dari partner Open API, mengolahnya, lalu mengembalikan final answer ke SatuInbox.

Tujuan bisnis utama adalah mengurangi beban manual CS untuk use case yang berulang, menjaga customer tetap dilayani cepat, dan tetap memastikan human agent masuk ketika AI tidak mampu menyelesaikan percakapan.

---

## 2\. Problem Statement

### 2.1 Masalah utama

1.  Banyak pertanyaan customer bersifat berulang dan mengikuti pola jawaban yang sama.
2.  Tidak semua pertanyaan butuh human agent sejak awal; sebagian hanya butuh jawaban edukasi atau jawaban berbasis data tertentu.
3.  Sebagian pertanyaan membutuhkan eskalasi ke divisi operasional tertentu seperti IT, LM, BD, Finance, atau FM.
4.  SatuInbox belum memiliki layer orkestrasi AI yang terintegrasi dengan sistem eksternal sambil tetap menjaga flow human handling, SLA, dan routing yang sudah ada.

### 2.2 Dampak bisnis

*   Human agent memakan waktu untuk case yang seharusnya bisa diselesaikan otomatis.
*   Customer menunggu lebih lama untuk pertanyaan berulang atau FAQ operasional.
*   Potensi inkonsistensi jawaban antar agent.
*   Risiko salah routing atau keterlambatan handoff jika AI tidak punya contract eskalasi yang jelas.

---

## 3\. Business Goal

### 3.1 Goal utama

Membangun kemampuan AI chat orchestration di SatuInbox dengan `chatbox.id` sebagai penyedia agent AI, sehingga:

*   customer tetap berinteraksi melalui SatuInbox,
*   AI dapat menangani pertanyaan yang layak dijawab otomatis,
*   human agent hanya masuk ketika dibutuhkan,
*   dan seluruh flow tetap kompatibel dengan mekanisme operasional SatuInbox.

### 3.2 Outcome yang diharapkan

*   Waktu respon awal untuk pertanyaan umum menurun.
*   Beban human agent untuk pertanyaan repetitif berkurang.
*   Kualitas handoff ke human meningkat melalui rangkuman AI.
*   Operasional tetap aman karena routing human, SLA, dan boundaries company tidak rusak.

---

## 4\. Scope

### 4.1 In Scope

*   Integrasi SatuInbox ↔ `chatbox.id` melalui MCP.
*   AI menangani percakapan customer untuk channel yang eligible.
*   AI boleh menjawab dan menutup conversation pada channel yang diizinkan.
*   AI dapat memicu eskalasi ke human agent.
*   Saat eskalasi, transcript AI ↔ customer harus bisa dibaca human agent.
*   Escalation summary / utility message untuk membantu human handoff.
*   Channel awal yang sedang dipertimbangkan: livechat widget, WhatsApp Web, WhatsApp Official.
*   Halaman konfigurasi di SatuInbox agar client tidak perlu membuka dua aplikasi.
*   Metrik AI terpisah dari metrik human.
*   Real CS case patterns sebagai referensi intent dan action policy.

### 4.2 Out of Scope

*   Pengadaan model / provider LLM internal di SatuInbox.
*   Pengelolaan knowledge base canggih dalam fase awal.
*   Channel lain di luar candidate awal.
*   Integrasi direct dari SatuInbox ke partner Open API jika kontrak data hanya dimiliki `chatbox.id`.
*   Dev-ready technical contract detail untuk semua failure path pada tahap BRD.
*   Budget model

### 4.3 Notes / Clarification Needed

*   Ticketing masih perlu klarifikasi apakah hanya analytics/assist atau termasuk AI handling lane.
*   Tiga channel awal masih perlu validasi stakeholder.
*   Detail fallback MCP/chatbox.id/partner masih perlu breakdown lanjutan.

---

## 5\. Actor Definitions

| Actor | Definisi |
| --- | --- |
| Customer | Orang yang bertanya ke client/user melalui channel SatuInbox |
| Client/User | Pengguna SatuInbox: agent, supervisor, admin |
| chatbox.id | Penyedia layanan agent AI |
| Partner | Penyedia data pendukung yang diakses `chatbox.id` via Open API |
| Admin | Role yang otomatis memiliki hak konfigurasi awal AI |

---

## 6\. Current Business Flow vs Proposed Flow

### 6.1 Current Flow

1.  Customer menghubungi melalui channel.
2.  Percakapan masuk ke operasional human agent.
3.  Agent membaca konteks, menjawab, atau meneruskan ke divisi lain.
4.  Banyak jawaban masih mengikuti pola makro dan edukasi yang berulang.

### 6.2 Proposed Flow

1.  Customer menghubungi melalui channel SatuInbox.
2.  SatuInbox meneruskan pesan ke `chatbox.id` via MCP bila channel dan policy memenuhi syarat.
3.  `chatbox.id` menganalisis intent.
4.  Jika perlu data tambahan, `chatbox.id` mengambilnya dari partner Open API.
5.  `chatbox.id` mengembalikan final answer + summary ke SatuInbox.
6.  Jika use case aman ditangani AI, SatuInbox mengirim jawaban ke customer dan AI dapat menutup conversation.
7.  Jika AI tidak mampu atau policy mensyaratkan human handling, `chatbox.id` memicu eskalasi.
8.  Setelah eskalasi, percakapan masuk ke dashboard Conversation untuk diproses human agent dengan mekanisme routing normal.

---

## 7\. Core Business Rules

### 7.1 Visibility

*   Chat yang sedang ditangani AI belum perlu visible ke client/user sejak awal.
*   Chat menjadi visible ketika terjadi eskalasi ke human.
*   Saat visible, human agent harus bisa membaca seluruh transcript AI ↔ customer.

### 7.2 Company Boundary

*   Chat yang masuk melalui account channel milik company tertentu harus kembali ditangani oleh client/user di company yang sama.
*   Tidak boleh ada handoff lintas company secara tidak sengaja.

### 7.3 Escalation to Human

*   Ketika trigger eskalasi terjadi, flow human harus aktif seperti biasa.
*   Pull conversation atau round robin harus berjalan sebagaimana mestinya sesuai policy operasional.
*   Agent AUX harus tetap dihormati dalam routing human lane.

### 7.4 SLA

*   SLA human dimulai sejak timestamp eskalasi ke human agent.
*   AI handling membutuhkan metrik terpisah dari SLA human.
*   Aktivitas AI tidak boleh mencemari metrik agent performance.

### 7.5 AI Close Authority

*   Sementara AI boleh menutup tiga channel yang ditentukan untuk fase awal.
*   Channel lain belum menggunakan AI agent.

### 7.6 Final Answer Policy

*   Output yang dikirim balik ke customer fokus pada final answer.
*   Summary disiapkan untuk kebutuhan operasional / handoff, bukan sebagai konten utama customer-facing.

### 7.7 Access / Permission

*   Role Admin otomatis memiliki hak akses.
*   Role lain hanya memiliki hak bila permission diaktifkan.

---

## 8\. Real CS Use Case Insight

Referensi nyata dari `Downloads/Case CS - Sheet1.tsv` menunjukkan pola berikut:

### 8.1 Use case yang cenderung aman untuk AI answer / edukasi

*   Perubahan metode COD ke Non COD
*   Perubahan nominal COD tidak bisa
*   Seller input form melalui OO namun pengiriman menggunakan lincah
*   Sistem cover COD namun 3PL tidak
*   Penyesuaian berat yang sifatnya edukasi prosedural

### 8.2 Use case yang cenderung butuh eskalasi / routing divisi

*   Notif error di dashboard → IT
*   Regenerate resi berulang → IT
*   Request grup seller → BD
*   Takeback COD → LM
*   Operational issue Ninja / refund → LM / Claim / Finance tergantung hasil
*   Issue sensitif terkait ekspedisi tertentu → divisi terkait

### 8.3 Implikasi bisnis

AI tidak cukup hanya menjadi bot FAQ. AI harus bisa membedakan minimal empat mode tindakan:

1.  jawab dan close
2.  jawab dengan makro/edukasi lalu close
3.  jawab sambil minta data tambahan
4.  eskalasi ke divisi / human tertentu

---

## 9\. Needed Capabilities

### 9.1 Customer-facing capabilities

*   Balasan AI melalui channel SatuInbox
*   Respons konsisten untuk pertanyaan operasional yang umum
*   Jalur cepat ke human ketika AI tidak mampu menangani

### 9.2 Human-agent capabilities

*   Melihat transcript penuh AI ↔ customer saat eskalasi
*   Melihat summary utility message saat handoff
*   Menerima chat melalui routing normal SatuInbox

### 9.3 Admin / ops capabilities

*   Mengatur enablement AI per channel / account
*   Mengatur policy eskalasi dan close authority
*   Melihat log dan analytics AI

---

## 10\. Business Risks

1.  AI menjawab use case yang seharusnya wajib eskalasi.
2.  Chat hilang atau stuck saat MCP / `chatbox.id` / partner gagal.
3.  Handoff masuk ke queue yang salah atau melanggar boundary company.
4.  SLA human menjadi tidak adil jika AI phase ikut terhitung.
5.  Permission tidak jelas sehingga role yang salah bisa mengubah konfigurasi.

---

## 11\. Open Questions

1.  Ticketing scope: apakah hanya assist/analytics setelah eskalasi atau termasuk AI handling di ticket thread?  
    \- HOLD perlu MCP (superadmin-untuk lihat keseluruhann data)
2.  Breakdown fallback detail untuk MCP timeout / chatbox.id failure / partner API failure seperti apa?  
    \- FAQ classifier punya rule, data spesifik dan model yang di pakai harus di tentukan dulu, guardrail nya juga harus di setup dengan benar  
    \- punya  PR untuk training AI agent juga  
    \- kalau mau penerapan awal berupa FAQ dulu  
    \- onboarding ke 4 orang (atik, eva, alam, nasza) untuk training ai ini
3.  Apakah stakeholder setuju tiga channel awal: livechat widget, WhatsApp Web, WhatsApp Official?  
    \- 1 channel untuk dipergunakan sebagai phase 1, livechat  
    \- untuk channel lain, di hold dulu, potensi block nya terutama whatsapp sangat tinggi
4.  Apakah summary utility cukup satu message utility atau butuh surface tambahan?  
    \- P3
5.  Permission key non-admin untuk config/log/analytics AI apa saja?  
    \- admin only
6.  Intent mana yang aman dijawab + ditutup AI, dan intent mana yang wajib selalu eskalasi?  
    \- dari poin 2, classifier nya sudah lengkap dan detail, poin ini bisa ter-handle

---

## 12\. Success Criteria

### 12.1 Business indicators

*   Pertanyaan repetitif tertentu dapat diselesaikan tanpa human agent.
*   Human agent menerima handoff dengan konteks yang lebih lengkap.
*   Tidak ada regresi pada routing human dan SLA operasional.
*   Customer tetap menerima jawaban yang konsisten.

### 12.2 Operational indicators

*   Escalated conversation masuk ke company dan lane yang benar.
*   Transcript dan summary tersedia saat handoff.
*   Metrik AI dan human terpisah.

---

## 13\. Suggested Next Requirement Packaging

Setelah BRD ini, requirement kemungkinan perlu dipecah ke beberapa paket:

1.  AI Chat Orchestration Core
2.  Escalation & Human Routing Compatibility
3.  Config Page / Access Control
4.  Intent-to-Action Policy from Real CS Use Cases
5.  AI Metrics & Reporting

---

## 14\. Change Log

| Date | Change | Author |
| --- | --- | --- |
| 2026-07-01 | Initial BRD draft created from Change Intake Brief v1.2 | Hermes |