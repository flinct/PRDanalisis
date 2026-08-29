# Per-Topic Domain Restriction untuk Widget Channels

## Analisis & Brainstorm — SatuInbox Widget Feature

---

## 🎯 PONYTAIL RECOMMENDATION (Jalur Tercepat yang Bisa Jalan)

**Taruh `allowedDomains` di level `widgetTopics[]` entry di dalam AccountChannel.** Satu field array string. Filter di endpoint `/widget/settings` dengan match `Origin` header.

```
// Perubahan data model: TIDAK ADA schema baru. Cuma tambah 1 field.
// widgetTopics entry:
{
  topicId: "...",
  topicName: "Support",
  subTopic: "...",
  lastSyncedAt: "...",
  allowedDomains: ["*.tokopedia.com", "shopee.co.id"]  // ← tambah ini aja
}
```

**Kenapa di sini, bukan di Topic?**
- Topic itu global per company. Domain restriction itu per-channel context.
- Satu topic "Support" bisa dipakai di 3 channel berbeda, tiap channel beda domain rules.
- Kalau taruh di Topic, kamu memaksa semua channel share rule yang sama = kaku.

**Kenapa bukan di WidgetSettings?**
- WidgetSettings = satu per company. Sama kaku.
- Kamu perlu granularity per-topic-per-channel.

**Kenapa bukan schema baru (e.g., TopicDomainRule)?**
- Over-engineering. Satu array field di widgetTopics entry sudah cukup.
- Menghindari JOIN/gRPC call tambahan antar service.

---

## Detail Perubahan

### 1. Data Model (Minimal Change)

**Lokasi:** `account-channel.schema.ts` → `widgetProperties.widgetTopics[]`

```typescript
// BEFORE
widgetTopics: [{
  topicId: Types.ObjectId,
  topicName: String,
  subTopic: String,
  lastSyncedAt: Date
}]

// AFTER — tambah satu field opsional
widgetTopics: [{
  topicId: Types.ObjectId,
  topicName: String,
  subTopic: String,
  lastSyncedAt: Date,
  allowedDomains: { type: [String], default: [] }  // [] = semua domain (backward compat)
}]
```

**Aturan:**
- `allowedDomains: []` (kosong) → topic tampil di SEMUA domain (default, backward compatible)
- `allowedDomains: ["tokopedia.com"]` → topic hanya tampil di domain tsb
- Format: hostname saja (tanpa protocol/port), case-insensitive match

### 2. Domain Matching — Simple Exact + Wildcard Prefix

**MVP approach: hostname exact match + prefix wildcard**

```typescript
function matchDomain(domain: string, patterns: string[]): boolean {
  // ponytail: no regex, no npm package, just string ops
  const d = domain.toLowerCase().replace(/^www\./, '');
  return patterns.some(p => {
    const pattern = p.toLowerCase().replace(/^www\./, '');
    if (pattern.startsWith('*.')) {
      return d === pattern.slice(2) || d.endsWith('.' + pattern.slice(2));
    }
    return d === pattern;
  });
}
```

**Contoh:**
| Pattern | Domain | Match? |
|---------|--------|--------|
| `tokopedia.com` | `tokopedia.com` | ✅ |
| `tokopedia.com` | `www.tokopedia.com` | ✅ (www. stripped) |
| `tokopedia.com` | `api.tokopedia.com` | ❌ (exact) |
| `*.tokopedia.com` | `api.tokopedia.com` | ✅ |
| `*.tokopedia.com` | `tokopedia.com` | ✅ |
| `localhost` | `localhost` | ✅ |

**Skip:** regex, npm packages, URL parser libs. String ops cukup.

### 3. Backend Changes (4 Files Utama)

#### a. Schema (`apps/channel-service/src/app/schemas/account-channel.schema.ts`)
- Tambah `allowedDomains: [String]` di widgetTopics sub-schema
- Default: `[]`

#### b. Widget Open Controller (`apps/api-gateway/src/app/widget/widget.open.controller.ts`)
**INI PERUBAHAN UTAMA.**

```typescript
// BEFORE: GET /widget/settings → return semua widgetTopics
// AFTER: GET /widget/settings → filter widgetTopics berdasarkan Origin header

@Get('settings')
async getSettings(@Req() req, @Query('apiKey') apiKey) {
  const origin = req.headers['origin'] || req.headers['referer'] || '';
  const domain = extractHostname(origin);
  
  const settings = await this.getWidgetSettings(apiKey); // existing logic
  
  // Filter topics by domain
  if (domain) {
    settings.widgetTopics = settings.widgetTopics.filter(topic => {
      if (!topic.allowedDomains || topic.allowedDomains.length === 0) {
        return true; // no restriction = show everywhere
      }
      return matchDomain(domain, topic.allowedDomains);
    });
  }
  
  return settings;
}
```

#### c. Widget Controller — CRUD (`apps/api-gateway/src/app/widget/widget.controller.ts`)
- Update endpoint `PATCH /widget/topics/:id` atau `PATCH /widget/settings` untuk accept `allowedDomains` field
- Validasi: max 50 domains per topic, valid hostname format

#### d. Caching Impact
- Cache key sekarang HARUS include domain context, atau:
  - **Opsi A:** Serve full data, filter di edge (proxy/CDN) → complex
  - **Opsi B:** Remove per-company cache, gunakan per-company+domain cache → cache explosion
  - **Opsi C (PONYTAIL):** JANGAN cache filtered response. Cache full response seperti sekarang, filter di application layer setelah cache hit. Cache 1 day tetap jalan, filtering itu O(n) on ~10-50 topics = negligible.
  
**Pilih Opsi C.** Zero cache structure change.

### 4. Frontend Changes

#### a. Settings UI (Admin Panel)
- Di halaman channel settings → widget topics management:
  - Per topic row: tambah input field "Domain yang Diizinkan"
  - Chip/tag input (comma-separated atau multi-line)
  - Hint: "Kosongkan = tampil di semua domain"
  - Max 50 domain entries per topic
  
#### b. Widget Embed Script
- **TIDAK ADA perubahan.** Script embed cuma load settings dari `/widget/settings` berdasarkan API key. Domain dikirim via `Origin` header secara otomatis oleh browser. Zero script change.

### 5. Security

| Aspek | Status | Catatan |
|-------|--------|---------|
| Domain spoofing via Origin header | ⚠️ Risiko rendah | Origin header dikirim otomatis oleh browser, sulit di-spoof dari cross-origin request. Attacker perlu kontrol browser code = sudah game over |
| CORS enforcement | ✅ Sudah ada | Pastikan CORS policy widget API hanya accept origin yang valid |
| API key abuse | ⚠️ Sama seperti sekarang | Domain restriction bukan security feature, ini display/tenant isolation |
| Rate limiting | Tidak berubah | |
| Data leak | ❌ Tidak ada | Topic filtered = tidak dikirim, bukan hidden di FE |

**PENTING:** Domain restriction ini BUKAN security boundary. Ini organizational/display feature. Jangan dijual sebagai security ke customer.

### 6. Edge Cases

| Kasus | Penanganan |
|-------|-----------|
| `allowedDomains` kosong/tidak ada | = tampil di semua domain (backward compatible) |
| `localhost` / `127.0.0.1` | Allowed khusus jika ada di pattern. Dev/staging domains harus didaftarkan |
| `www.` prefix | Strip saat matching (`www.tokopedia.com` == `tokopedia.com`) |
| Subdomain handling | `*.tokopedia.com` match semua subdomain + bare domain |
| HTTP vs HTTPS | Tidak relevan, match di hostname level saja |
| Referer header tidak ada | Tampilkan semua topics (fail-open, bukan fail-closed) — ini display feature, bukan security |
| Multiple domains embedded | Setiap page load → fresh request ke `/widget/settings` → filtered per domain |

### 7. Migration & Backward Compatibility

**Zero-downtime migration:**
- Field `allowedDomains` default `[]` = no restriction
- Tidak perlu data migration script
- Existing topics otomatis tampil di semua domain (behavior tidak berubah)
- FE admin bisa mulai set domain restriction kapan saja
- Feature toggle tidak diperlukan — empty array = old behavior

**Proto/gRPC:**
- Update proto definition untuk widgetTopics entry: tambah `repeated string allowed_domains = N;`
- Backward compatible (empty = absent dalam proto3)

### 8. Risk Assessment

| Risiko | Likelihood | Impact | Mitigasi |
|--------|-----------|--------|---------|
| Cache serving unfiltered topics | Rendah | Sedang | Filter di app layer post-cache (Opsi C) |
| Domain regex DoS | N/A | N/A | Tidak pakai regex |
| Broken existing widgets | Rendah | Tinggi | Default [] = no change in behavior |
| Performance di /widget/settings | Rendah | Rendah | Array filter O(n) on ~50 topics = <1ms |
| gRPC proto breaking change | Rendah | Tinggi | Tambah field optional, jangan hapus |
| Customer confusion (localhost dev) | Sedang | Rendah | Document: "tambahkan localhost ke allowed domains untuk dev" |

### 9. Alternatives yang Dipertimbangkan (dan Ditolak)

| Alternatif | Alasan Ditolak |
|-----------|---------------|
| `allowedDomains` di Topic schema | Topic global per company, domain restriction per-channel. Bikin kaku |
| Schema baru `TopicDomainRule` | Over-engineering, 1 field cukup |
| Domain validation via DNS/HTTPS | Out of scope, overkill |
| Client-side domain check | Mudah di-bypass, tidak reliable |
| New microservice DomainFilter | LOL. No. |
| Redis per-domain cache | Cache explosion, tidak perlu |

### 10. Estimasi Effort

| Task | Effort |
|------|--------|
| Schema change (1 field) | 1 jam |
| gRPC proto update | 1 jam |
| Widget open controller filter logic | 2 jam |
| Admin UI domain input component | 3 jam |
| Testing (unit + integration) | 4 jam |
| Documentation | 1 jam |
| **TOTAL** | **~12 jam (1.5 hari)** |

---

## Kesimpulan

**Feasibility: TINGGI.** Satu field array di widgetTopics entry + satu filter function di widget open controller. Tidak perlu schema baru, tidak perlu microservice baru, tidak perlu npm package baru. Cache structure tidak berubah. Backward compatible by default. Estimasi 1.5 hari untuk full implementation.

**Yang perlu diputuskan:**
1. Format domain matching: exact + wildcard cukup? Atau perlu regex?
2. Max allowed domains per topic: 50? 100? Unlimited?
3. Fail-open vs fail-closed ketika Origin header tidak ada?
4. Siapa yang bisa set domain restriction? Admin channel saja atau company admin juga?
