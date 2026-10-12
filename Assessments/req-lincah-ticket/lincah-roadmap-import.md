# Roadmap Task Import — Template Format v2
#
# Hierarchy:
#   ## <ID> — <Title>      = MILESTONE (user story from brief, the main task)
#   ### BD: <title>         = BREAKDOWN (technical task from assessment, child of milestone)
#
# Required fields (milestone): Area, Priority, Source
# Optional fields (milestone): Status, Depends, Dev, QA
# Required fields (breakdown): Effort (specific "Xd dev, Yd QA"), Gap
# Optional fields (breakdown): Dev, QA (per-breakdown resource override)
#
# Resource rules:
#   Dev/QA field empty  → default team (Naftal=Dev, Agung=QA)
#   Dev/QA field filled → override or "+N" for temporary addition
#
# Import flow:
#   1. Parse ## blocks → create milestone tasks
#   2. Parse ### BD: blocks → create breakdown subtasks linked to parent milestone
#   3. Duplicate check per milestone + per breakdown (OP + IDB)
#   4. Resource: Dev/QA → assignees[]; empty = default
#
# Roadmap mapping:
#   ## Title     → task (milestone) / subtask (breakdown)
#   Area         → strategicArea (milestone only)
#   Priority     → priority (milestone only)
#   Effort       → effort
#   Description  → desc (milestone = user story; breakdown = technical gap)
#   Dev/QA       → assignees[] override
#   Status       → filter (skip "deferred" on bulk import)

---

## 1A — Ticket Grouping by Custom Attribute

**Area:** Ticket
**Priority:** P1
**Source:** Brief Lincah §1A

SatuInbox perlu mendukung grouping ticket berdasarkan Custom Attribute/Property yang configurable. Attribute untuk grouping harus configurable sesuai use case (contoh: Seller, AWB), tidak hardcoded.

### BD: FE Grouping UI

**Effort:** 3d dev, 2d QA
**Gap:** Ticket list view butuh group-by dropdown yang pakai existing `relationLabels` untuk visual grouping. BE sudah ready (`bulkApplyRelationLabel`, `relationLabelKey` filter).

---

## 2A — Link Chat to Ticket via Open API

**Area:** Omnichannel
**Priority:** P1
**Source:** Brief Lincah §2A

Sediakan Open API untuk menghubungkan chat/conversation dengan ticket tertentu. Satu contact/nomor telepon bisa terhubung ke lebih dari satu ticket (kasus: 1 customer, beberapa shipment sekaligus). Relasi harus bisa dibuat dan dibaca kembali via API.

### BD: Post-Creation Link Endpoint

**Effort:** 2d dev, 1d QA
**Gap:** `conversationId` bisa di-set saat create, tapi tidak ada endpoint untuk link existing conversation ke existing ticket. Butuh `POST /open-api/ticket/:id/link-conversation`. Pastikan relasi contact → multiple tickets readable.

---

## 3A — Bulk Ticket Update

**Area:** Ticket
**Priority:** P0
**Source:** Brief Lincah §3A

Bulk update ticket terhadap beberapa ticket sekaligus, termasuk Custom Properties. User bisa Select All pada filter aktif. Supported field: Selection, Text, Date, Image, Gallery (multiple images), File. Satu value diterapkan ke semua selected. Bulk update ikuti permission user.

### BD: Bulk Update Endpoint

**Effort:** 5d dev, 3d QA
**Gap:** New `POST /open-api/ticket/bulk-update` — accept ticket IDs + field updates. Validasi `customAttributes` per ticket type. V1 = same type only. Reuse existing bulk infra (`bulk-job.schema`, `TICKET_BULK_LIMIT=100`).

---

## 4A — Broadcast Create via Open API with Attachment

**Area:** Broadcast
**Priority:** P1
**Source:** Brief Lincah §4A

Buat broadcast via Open API dengan payload: title/reference, channel, audience, message, attachment/file, custom properties, team inbox, reference data dari Lincah. Response harus return `broadcast_id`, status, `created_at`, title.

### BD: Attachment Field in DTO

**Effort:** 3d dev, 2d QA
**Gap:** `OpenApiBroadcastDto` tidak punya attachment field. Tambah `attachment` field (file URL atau media ID). Handle media upload/download di broadcast service.

---

## 5A — Create Broadcast via Deep Link

**Area:** Broadcast
**Priority:** P2
**Status:** deferred
**Source:** Brief Lincah §5A

Deep link dari dashboard Lincah ke halaman Create Broadcast SatuInbox dengan predefined parameters (title, recipient, channel, message, attachment, custom properties, reference ID). User review sebelum kirim.

**Assessment decision:** Covered by 4A (Open API). Deep link = nice-to-have. Deferred sampai 4A live.

---

## 6A — Broadcast Channel Expansion + Attachment Types

**Area:** Broadcast
**Priority:** P1
**Source:** Brief Lincah §6A

Broadcast perlu dukung WhatsApp Group dan attachment types lengkap (Excel, PDF, Image, DOC, file umum, link report). Attachment bisa bersama text atau sebagai content utama. Juga support scheduled report broadcast dari Lincah (per jam/per hari).

### BD: WA Group Channel Enum

**Effort:** 2d dev, 1d QA
**Gap:** Tambah `WHATSAPP_GROUP` ke `BroadcastPlatformEnum`. Handle group delivery semantics (beda dari 1:1). Email channel = P2 deferred.

### BD: Attachment Upload + Scheduled Report

**Effort:** 3d dev, 2d QA
**Gap:** Broadcast service harus support attachment types (Excel/PDF/Image/DOC/file/link). Scheduled report: Lincah generate → Create Broadcast API → delivery. SatuInbox = delivery channel.

---

## 7A — Broadcast Status, History & Retry

**Area:** Broadcast
**Priority:** P1
**Source:** Brief Lincah §7A

Expose broadcast status per-recipient dan retry mechanism via Open API. Lincah perlu: check status → identify failed → retry only failed recipients. Deep link per broadcast ke detail page.

### BD: Broadcast Status API

**Effort:** 2d dev, 1d QA
**Gap:** `GET /open-api/broadcast/:id/status` — per-recipient status (Pending/Queued/Sent/Failed/Cancelled) + failure reason + timestamp. Response: overall status + per-recipient breakdown.

### BD: Broadcast Detail + Deep Link

**Effort:** 1d dev, 1d QA
**Gap:** `GET /open-api/broadcast/:id` — broadcast detail. Tiap broadcast punya deep link ke SatuInbox detail page.

### BD: Broadcast Retry API

**Effort:** 2d dev, 1d QA
**Gap:** `POST /open-api/broadcast/:id/retry` — retry all atau failed only. Result linked ke original broadcast. Internal `BroadcastRetryProcessor` sudah ada, gap = API exposure.

---

## 8A — Ticket Webhook Enhancement + Two-Way Sync

**Area:** Ticket
**Priority:** P1
**Source:** Brief Lincah §8A

Enhance webhook untuk field-level change tracking. Webhook harus fire untuk: status, assignment, team inbox, custom property, resolved/reopened, conversation-linkage changes. Delivery status: Success, Failed, Retrying, Retry Exhausted. Two-way sync: Lincah→SI via API, SI→Lincah via webhook.

### BD: Webhook Payload Enhancement

**Effort:** 3d dev, 2d QA
**Gap:** `TicketUpdateContext` cuma punya `prevStatus`/`prevStageId` — butuh field-level diff. Tambah `RETRY_EXHAUSTED` ke `WebhookLogStatusEnum`. Tambah trigger untuk conversation-ticket linkage change.

---

## 9A — Update Team Inbox via Open API

**Area:** Ticket
**Priority:** P2
**Source:** Brief Lincah §9A

Team Inbox dari conversation/contact harus bisa diubah via Open API. Perubahan: langsung reflected, maintain linkage, audit trail, webhook ke Lincah.

### BD: Verify Coverage

**Effort:** 1d dev, 1d QA
**Gap:** `PATCH /open-api/ticket/:id/team` sudah ada. Verify: conversation-level update, audit trail logging, webhook emission. Kemungkinan no new endpoint.

---

## 10A — Integration Identifiers Documentation

**Area:** Growth
**Priority:** P3
**Source:** Brief Lincah §10A

Dokumentasi identifier utama integrasi Lincah ↔ SatuInbox: seller_id, awb, contact_id, conversation_id, ticket_id, broadcast_id, team_inbox_id.

### BD: Write Reference Doc

**Effort:** 1d
**Gap:** Documentation only. `seller_id` dan `awb` = custom attribute keys, bukan system IDs. Buat integration identifiers reference doc.
