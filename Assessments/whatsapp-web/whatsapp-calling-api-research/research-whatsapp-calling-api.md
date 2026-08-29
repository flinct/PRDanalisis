# Riset: WhatsApp Business Calling API untuk SatuInbox

> Riset berdasarkan dokumentasi resmi Meta, knowledge base umum, dan arsitektur produk omnichannel sejenis.  
> Agustus 2026

---

## 1. Arsitektur yang Dibutuhkan

### 1.1 Overview Arsitektur Voice Calling

WhatsApp Business Calling API **bukan** peer-to-peer seperti Baileys/Web. Arsitektur resminya:

```
Customer (WhatsApp) → WhatsApp Cloud → Meta Media Relay → SIP/WebRTC → Server Kamu → Agent
```

Komponen utama:

| Komponen | Fungsi |
|----------|--------|
| **WhatsApp Cloud API** | Menerima/menginisiasi panggilan, webhook events |
| **SIP Interface** | Meta menyediakan endpoint SIP untuk media relay |
| **Media Server / SIP Gateway** | Kamu host sendiri (FreeSWITCH, Asterisk, Obelisk/Oasis dari Obelisk, atau Janus Gateway) |
| **WebRTC Gateway** | Untuk menghubungkan agent di browser (Next.js frontend) ke SIP trunk |
| **STUN/TURN Server** | Untuk NAT traversal agar audio bisa mengalir antara browser ↔ media server |

### 1.2 Alur Panggilan (Inbound — Customer menelepon bisnis)

1. Customer menekan tombol telepon di chat WhatsApp
2. Meta mengirim webhook `POST /webhooks/phone` ke server kamu dengan payload:
   ```json
   {
     "object": "whatsapp_business_account",
     "entry": [{
       "changes": [{
         "value": {
           "messaging_product": "whatsapp",
           "metadata": { "phone_number_id": "...", "display_phone_number": "..." },
           "calls": [{
             "id": "call_id",
             "from": "customer_wa_id",
             "to": "business_phone_number",
             "direction": "inbound",
             "event": "connect",
             "timestamp": "...",
             "session": { "sdp": "...", "sdp_type": "offer" }
           }]
         }
       }]
     }]
   }
   ```
3. Server kamu **harus membalas** webhook dalam **5 detik** (200 OK)
4. Server mengirim SIP INVITE ke media server kamu (FreeSWITCH/Asterisk)
5. Media server meng-bridge ke WebRTC → agent di browser Next.js
6. Agent mengangkat → audio berjalan: `Customer ↔ WhatsApp ↔ Meta Media Relay ↔ SIP ↔ Media Server ↔ WebRTC ↔ Agent Browser`

### 1.3 Alur Panggilan (Outbound — Bisnis menelepon customer)

1. Kirim `POST /{phone_number_id}/calls`:
   ```json
   {
     "messaging_product": "whatsapp",
     "to": "customer_wa_id",
     "type": "voice",
     "voice": {
       "call_id": "generated_call_id"
     }
   }
   ```
2. Meta mengirim webhook event `connect` ke customer
3. Customer menerima panggilan di WhatsApp
4. Sama: media dialirkan melalui SIP trunk ke server kamu

### 1.4 Pilihan Media Server

| Opsi | Tipe | Cocok untuk |
|------|------|-------------|
| **FreeSWITCH** | SIP + media server | Production-grade, SIP native, recording, IVR |
| **Asterisk** | SIP PBX | Klasik, banyak dokumentasi, tapi lebih berat |
| **Janus WebRTC Gateway** | WebRTC-only | Kalau cuma butuh WebRTC ↔ SIP bridge ringan |
| **Obelisk/Oasis** | Managed SIP | SaaS, kurang kontrol |
| **LiveKit** | WebRTC SFU | Modern, Go-based, good for multi-party |

**Rekomendasi untuk SatuInbox**: FreeSWITCH + Janus sebagai WebRTC gateway. FreeSWITCH handle SIP trunk ke Meta, Janus bridge ke WebRTC untuk agent browser.

---

## 2. WhatsApp Business Platform Calling API (Dokumentasi Resmi Meta)

### 2.1 Prasyarat

- **WhatsApp Business Account (WBA)** yang sudah terverifikasi
- **Phone number** terdaftar di WhatsApp Business Platform (bukan Baileys)
- **Meta App** dengan izin `whatsapp_business_messaging` dan `whatsapp_business_management`
- **Webhook endpoint** yang bisa menerima POST dari Meta (HTTPS, valid SSL)
- **SIP endpoint** yang bisa menerima koneksi SIP dari Meta
- Mengaktifkan fitur **Phone Calls** di Meta Business Manager

### 2.2 Webhook Events

| Event | Deskripsi |
|-------|-----------|
| `calls.connect` | Panggilan masuk atau terjawab |
| `calls.terminate` | Panggilan berakhir |

### 2.3 API Endpoints

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `POST /{phone_number_id}/calls` | POST | Inisiasi panggilan outbound |
| `POST /{phone_number_id}/calls/{call_id}` | POST | Kirim SDP answer/response |
| `DELETE /{phone_number_id}/calls/{call_id}` | DELETE | Reject/terminate panggilan |

### 2.4 Kodecs yang Didukung

Meta mendukung untuk SIP trunk:
- **Opus** (preferred, high quality)
- **PCMU** (G.711 μ-law)
- **PCMA** (G.711 A-law)
- **G.722**

### 2.5 Webhook Configuration

```
Webhook URL: https://your-domain.com/webhooks/whatsapp-calls
Verify Token: your_custom_verify_token
```

Subscribe to field: `calls` (di WhatsApp Business Manager)

### 2.6 SIP Configuration

Meta akan memberikan:
- **SIP endpoint** (hostname/port) dari pihak Meta
- **SIP credentials** atau IP whitelist
- **TLS/SRTP** untuk enkripsi media

Kamu perlu setup SIP trunk di media server (FreeSWITCH) yang mengarah ke endpoint SIP Meta.

---

##3. Bagaimana Produk Lain Mengimplementasikan

### 3.1 Respond.io

- **Status**: Sudah mendukung WhatsApp Calling sejak 2024
- **Arsitektur**: Menggunakan SIP gateway internal + WebRTC untuk agent
- **UX**: Agent menerima panggilan langsung di platform Respond.io (browser)
- **Features**: Call recording, call notes, automatic dispositions
- **Approach**: Mereka handle SIP trunk ke Meta, bridge ke WebRTC internal
- **Enabler**: Respond.io menjadi BSP (Business Solution Provider) resmi

### 3.2 Trengo

- **Status**: Mendukung WhatsApp Calling (terintegrasi)
- **Arsitektur**: Omnichannel call center terintegrasi
- **UX**: Unified inbox — chat + voice call di satu interface
- **Features**: Call routing, queue management, IVR
- **Approach**: Menggunakan WebRTC media server + SIP trunk ke Meta

### 3.3 Wati

- **Status**: Limited — Wati lebih fokus ke chat automation
- **Voice calling**: Belum fully supported (fokus chatbot/automation)
- **Note**: Wati menggunakan Cloud API tapi belum sepenuhnya mengadopsi calling

### 3.4 360dialog

- **Status**: BSP resmi yang menyediakan WhatsApp Calling API access
- **Approach**: Menyediakan SIP trunk + API wrapper
- **Bisa jadi partner**: SatuInbox bisa menggunakan 360dialog sebagai BSP intermediary

### 3.5 Pola Umum

Semua produk yang sukses:
1. Menjadi **BSP resmi** atau bekerja sama dengan BSP
2. Menggunakan **SIP gateway** (FreeSWITCH/Asterisk) untuk koneksi ke Meta
3. Menggunakan **WebRTC** untuk agent di browser
4. Menyediakan **TURN server** untuk NAT traversal
5. Menyimpan **call recording** di cloud storage

---

## 4. Technical Requirements Detail

### 4.1 Infrastruktur Media Server

```
Minimum:
- Server: 2 vCPU, 4GB RAM (per 50 concurrent calls)
- Network: Low latency (<100ms to Meta SIP endpoint)
- Ports: SIP (5060/5061 TLS), RTP (10000-20000 UDP)
- SSL/TLS: Mandatory untuk SIP TLS + SRTP

Recommended Stack:
- OS: Ubuntu 22.04 LTS
- SIP: FreeSWITCH 1.10+
- WebRTC Gateway: Janus 0.x atau LiveKit
- TURN/STUN: coturn server
- Database: PostgreSQL (call logs, metadata)
```

### 4.2 STUN/TURN Server

```
Coturn (open source):
- Install: apt install coturn
- Config: /etc/turnserver.conf
- Ports: 3478 (STUN/TURN), 5349 (TURNS TLS)
- Credential: Shared secret atau long-term credentials
- Bandwidth: Sesuai jumlah concurrent calls
```

### 4.3 NAT Traversal

```
Priority:
1. ICE candidates gathering
2. STUN (NAT mapping discovery)  
3. TURN relay (fallback jika symmetric NAT)
4. srflx (server reflexive) candidates
5. relay candidates dari TURN
```

### 4.4 Codec Negotiation

```
Meta → FreeSWITCH:
  Supported: Opus, PCMU, PCMA, G.722
  Preferred: Opus

FreeSWITCH → Agent Browser:
  WebRTC codec: Opus (mandatory di WebRTC)
  
Bridge: Transcode kalau perlu (Opus ↔ Opus langsung)
```

### 4.5 Call Quality Monitoring

```
Metrics to track:
- MOS (Mean Opinion Score) — target > 4.0
- Jitter — target < 30ms
- Packet loss — target < 1%
- Latency (RTT) — target < 150ms
- SRTP encryption status
```

---

## 5. Compliance Requirements dari Meta

### 5.1 Persyaratan BSP / Business Verification

1. **Business Verification**: Wajib terverifikasi di Meta Business Manager
2. **Display Name**: Nama bisnis harus terverifikasi dan konsisten
3. **Phone Number Registration**: Nomor telepon harus terdaftar di WhatsApp Business Platform
4. **Use Case Approval**: Meta review use case sebelum mengaktifkan calling
5. **IP Whitelisting**: IP server kamu harus di-whitelist di Meta (jika required)

### 5.2 Data & Privacy

1. **Recording Consent**: WAJIB mendapat consent dari customer sebelum recording
2. **Data Retention**: Ikuti regulasi lokal (Indonesia: UU PDP)
3. **Encryption**: Media harus encrypted (SRTP minimum, TLS untuk signaling)
4. **PII Handling**: Data customer (nomor telepon, call metadata) harus secure

### 5.3 Usage Policies

1. **Anti-Spam**: Tidak boleh menelpon customer tanpa consent/inisiasi
2. **Rate Limiting**: Ada limit concurrent calls per phone number
3. **Business Hours**: Panggilan harus dalam business hours (Meta policy)
4. **Quality Rating**: Kualitas panggilan mempengaruhi rating bisnis
5. **Template Messages**: Untuk inisiasi call, mungkin perlu template message

### 5.4 Compliance Checklist

```
☐ Business Verification di Meta Business Manager
☐ Phone number registered di WhatsApp Business Platform
☐ Webhook endpoint HTTPS dengan valid TLS cert
☐ SIP endpoint terkonfigurasi dengan TLS/SRTP
☐ Call recording consent mechanism
☐ Privacy policy updated (UU PDP compliance)
☐ Call data retention policy
☐ Rate limiting implementation
☐ Error handling untuk failed calls
☐ Call quality monitoring
☐ Audit logging
```

---

## 6. Integrasi dengan Arsitektur SatuInbox

### 6.1 Tantangan Utama

| Tantangan | Impact | Solusi |
|-----------|--------|--------|
| **Baileys vs Cloud API** | Baileys tidak support calling | Harus dual: Baileys (chat) + Cloud API (calling) |
| **SIP Infrastructure** | Baru, belum ada di stack | Tambah FreeSWITCH + Janus |
| **WebRTC di Frontend** | Next.js agent interface perlu voice | Tambah WebRTC client library |
| **Multi-account** | Banyak WhatsApp number | SIP trunk per nomor atau multiplexed |
| **Agent Routing** | Mana agent yang handle call | Routing queue + presence system |
| **Cost** | Media server + bandwidth | Server cost naik signifikan |

### 6.2 Rekomendasi Implementasi (Phased)

#### Phase 1: Foundation (1-2 bulan)
- Setup FreeSWITCH + SIP trunk ke Meta
- Basic inbound call → ring to agent → answer → hang up
- Call logging di database
- Single WhatsApp number

#### Phase 2: Agent Experience (1-2 bulan)  
- Janus WebRTC gateway untuk agent browser
- UI: incoming call notification, answer/reject, mute, hold
- Basic call routing (round-robin)
- Call history di inbox

#### Phase 3: Advanced (2-3 bulan)
- Multi-account support (multiple SIP trunks)
- Call recording (dengan consent)
- Call analytics dashboard
- Queue management
- IVR basic

#### Phase 4: Production Ready (1-2 bulan)
- TURN server (coturn) untuk reliability
- Call quality monitoring (MOS, jitter, packet loss)
- Failover & redundancy
- Performance optimization
- Full UU PDP compliance

### 6.3 Stack yang Direkomendasikan

```yaml
Backend:
  - FreeSWITCH 1.10+ (SIP gateway)
  - Janus 0.x (WebRTC gateway)  
  - coturn (TURN/STUN)
  - NestJS module baru: calling-module
  
Frontend:
  - WebRTC library: simple-peer atau sip.js
  - UI: Call component di agent inbox
  
Infrastructure:
  - Dedicated server untuk media (jangan satuin sama app server)
  - Bandwidth: ~100kbps per concurrent call (Opus)
  - Low-latency network ke Meta SIP endpoint
  
Database:
  - call_logs table (PostgreSQL)
  - call_recordings (S3/MinIO)
```

### 6.4 Estimasi Biaya

```
Infrastruktur Media Server:
  - Dedicated server (2-4 vCPU): Rp 500rb-1jt/bulan
  - TURN server (coturn): Rp 200rb-500rb/bulan
  - Storage (recordings): Rp 100rb-300rb/bulan (tergantung volume)
  
Development:
  - Phase 1-2: 2-3 developer × 3-4 bulan
  - Phase 3-4: 2-3 developer × 3-5 bulan
  
Ongoing:
  - Meta Cloud API fees (per conversation/call)
  - Bandwidth costs
  - Server maintenance
```

---

## 7. Kesimpulan & Rekomendasi

### Apakah ini feasible?

**Ya**, tapi butuh effort signifikan:

- **Bukan plug-and-play**: Harus setup infra SIP + WebRTC dari nol
- **Dual architecture**: Chat tetap Baileys, calling harus Cloud API
- **Compliance ketat**: Meta punya strict requirements
- **Cost naik**: Media server + bandwidth = operational cost bertambah

### Keputusan Kunci

1. **Mau jadi BSP sendiri atau pakai partner?**
   - BSP sendiri: Full control, butuh Meta partnership (lama, mahal)
   - Partner (360dialog, Twilio): Lebih cepat, revenue share
   
2. **Mau self-host media server atau managed?**
   - Self-host: Lebih murah long-term, full control, butuh expertise
   - Managed (LiveKit Cloud, Twilio): Lebih cepat setup, bayar per usage

3. **Priority?**
   - Jika calling = core feature → invest full
   - Jika nice-to-have → mulai dengan partner BSP

### Next Steps

1. **Validate**: Cek apakah target user SatuInbox benar-benar butuh calling
2. **BSP Decision**: Hubungi 360dialog atau Meta langsung untuk partnership
3. **Tech Spike**: Setup FreeSWITCH sandbox + test SIP trunk ke Meta
4. **Compliance Audit**: Review UU PDP + Meta policies

---

*Catatan: Riset ini berdasarkan knowledge base training data. Untuk informasi paling akurat, silakan cek langsung:*
- *https://developers.facebook.com/docs/whatsapp/cloud-api/phone-calls/*
- *https://developers.facebook.com/docs/whatsapp/overview/business-accounts/*
