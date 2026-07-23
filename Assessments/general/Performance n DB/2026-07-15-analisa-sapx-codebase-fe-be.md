# Session Summary — Analisa Masalah SAPX ke Codebase FE/BE SatuInbox

| Item | Value |
|---|---|
| Date | 2026-07-15 |
| Author | Dany Christian |
| Task Type | ANALYSIS / IMPACT (incident-driven codebase improvement) |
| Related Artifacts | `assessments/sapx/codebase-improvement/codebase-improvement-qa-assessment.md` |

## 1. Prompt / Request User

1. (Session sebelumnya) Analisa dokumen `SAP.pdf` — surat komplain PT SAPX ke Tim Engineering berisi 33 incident SatuInbox — lalu buat deck prioritas perbaikan (.pptx, sudah selesai di session sebelumnya).
2. (Session ini) "Dari permasalahan yang ada, analisa ke codebase FE dan BE, apa yang bisa di-improve dengan permasalahan itu. Lihat memory di PRDanalisis, lihat repo FE/BE di lokal."
3. Repo dikonfirmasi user: BE = `backend/`, FE = `frontend/` (keduanya di root workspace `qa-analysis/`).

## 2. Apa Yang Dikerjakan

- Memuat konteks dari `.claude/memory/claude-be.md`, `.claude/memory/claude-fe.md`, dan `.claude/memory/global-memory.md`.
- Menjalankan **4 agent analisa paralel**, satu per masalah SAPX, masing-masing menelusuri kode aktual FE + BE:
  1. Blank/stuck/error saat load
  2. Delay sync pesan 10–20 menit
  3. Misrouting chat ke agent Break/Day-Off
  4. Gangguan CRM + attachment gagal/rusak
- Sintesis 30 temuan menjadi Assessment Report dengan roadmap perbaikan 2 gelombang.

## 3. Hasil / Temuan Utama

### Masalah #1 — Blank/stuck saat load
- FE tidak punya `error.tsx`/`global-error.tsx` + Suspense `fallback={null}` → semua error/loading tampil sebagai blank screen.
- Tidak ada timeout di Axios FE maupun gRPC call di api-gateway (`conversation.controller.ts:191`) → downstream lambat = hang tanpa batas.
- Redis cache service tanpa try-catch → Redis down = error 500, bukan fallback.

### Masalah #2 — Delay sync 10–20 menit
- Download media Baileys **sinkron sebelum publish ke RabbitMQ** (`whatsapp-message.service.ts:552`) → satu media besar menahan pipeline; prefetch=10 memperparah antrean.
- `channel.ack()` **sebelum** socket emit (`inbound-message.processor.ts:293`) → emit gagal = pesan tak pernah sampai FE, tanpa retry.
- Blocking gRPC enrichment (team/contact) di critical path; socket emit fire-and-forget.

### Masalah #3 — Misrouting ke agent Break/DO
- **Root cause utama:** status member di-cache TTL **24 jam** dan tidak di-invalidate saat ganti status (`member.service.ts:2331,2347`) → auto-pull membaca status stale.
- Race window ±2 menit dengan auto-pull cron; tidak ada re-check fresh sebelum assignment.
- Manual assignment supervisor tidak mengecek status agent sama sekali.

### Masalah #4 — CRM + attachment
- Inbound media gagal upload → silent `return null` → pesan tersimpan permanen tanpa attachment.
- File 20MB + protobuf encoding ≈ 26,6MB mepet limit gRPC 30MB → upload besar gagal generic.
- Presigned URL expire 15 menit → media history tampak rusak; outbound media tanpa retry, status tetap "sent" walau gagal.

### Roadmap
- **Gelombang 1 (0–7 hari):** TTL status 5 menit + cache invalidation, error boundary + timeout FE/gateway, retry media inbound/outbound.
- **Gelombang 2 (8–30 hari):** decouple media dari inbound path, ack setelah emit, event `AGENT_STATUS_CHANGED`, streaming upload gRPC, presigned URL 24 jam.
- **Decision:** `PROCEED_WITH_CAUTION` — root cause teridentifikasi dengan confidence tinggi; beberapa temuan perlu verifikasi log produksi.

## 4. Artefak Yang Dihasilkan

- `assessments/sapx/codebase-improvement/codebase-improvement-qa-assessment.md` — Assessment Report v1.0 (30 temuan, file:line, roadmap).
- `.claude/rules/session-summary-rule.md` — rule baru: wajib simpan hasil prompting per session ke `summary/`.
- `summary/2026-07-15-analisa-sapx-codebase-fe-be.md` — file ini.
- (Session sebelumnya) Deck `SAPX_Analisa_Permasalahan_dan_Prioritas_Perbaikan_SatuInbox.pptx` di Downloads (12 slide).

## 5. Follow-up / Open Items

- Ubah temuan gelombang 1 menjadi tiket perbaikan konkret per tim (FE/BE) — ditawarkan, belum diminta.
- Verifikasi produksi: histogram durasi consumer `message.inbound.*`, log kegagalan socket emit, log kegagalan media, audit assignment ke agent non-READY.
- Temuan contact sync (#4.6) dan delivery receipt WhatsApp masih perlu investigasi lanjutan.
