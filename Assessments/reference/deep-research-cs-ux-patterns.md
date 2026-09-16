# Deep Research: UX Patterns Customer Service / Helpdesk Platforms

> Referensi untuk desain SatuInbox — omnichannel customer service platform  
> Stack: Next.js, React 19, Tailwind CSS 4  
> Platform studi: Intercom, Zendesk, Freshdesk, Front, Help Scout, Kayako, Chatwoot

---

## 1. Conversation Threading UX

### Best Practices (Yang Berhasil)

| Pattern | Platform | Implementasi |
|---------|----------|--------------|
| **Single Thread per Channel** | Zendesk Agent Workspace | Semua channel (email, chat, voice, social) masuk ke 1 thread kontinu. Agent tidak perlu switch tab. |
| **Chronological Flat Thread** | Help Scout | Semua pesan — agent reply, customer reply, private notes — tampil kronologis dalam 1 view. Notes diberi warna berbeda (kuning). |
| **Thread + Side Notes** | Front | Email thread di tengah, internal comments di sidebar. @mention teammates langsung di thread tanpa forward email. |
| **Messenger-style Continuity** | Intercom | Setiap interaksi adalah bagian dari "ongoing conversation" bukan ticket terpisah. Terinspirasi WhatsApp/messaging apps. |
| **Tab-per-channel in Thread** | Zendesk | Dalam 1 conversation, agent bisa switch channel (dari chat ke email) tanpa kehilangan konteks. |

### Yang Tidak Berhasil

- **Intercom**: Blending email dengan messaging channel sering "muddles context" — agent kesulitan memahami full history issue email karena formatnya tercampur dengan chat bubbles
- **Freshdesk**: Omnichannel experience terasa fragmented, interface berbeda antar channel memaksa agent context-switch
- **Kayako**: Journey tracking (fitur unik yang track seluruh customer journey) bagus secara konsep tapi sering overwhelm agent dengan terlalu banyak informasi

### Rekomendasi SatuInbox

```
Layout: 3-panel (sidebar kiri = conversation list, tengah = thread, kanan = customer context)
- Thread: flat chronological, bukan nested
- Private notes: inline tapi visually distinct (bg warna berbeda, icon 📌)
- Channel indicator: icon per channel di tiap message (WhatsApp 📱, Email 📧, IG 📸)
- Reply composer: unified, tidak perlu switch channel
```

---

## 2. Multi-Channel Switching

### Best Practices

| Pattern | Platform | Detail |
|---------|----------|--------|
| **Unified Inbox** | Chatwoot, Front | Semua channel masuk ke 1 shared inbox. Filter by channel tersedia tapi default view = semua. |
| **Channel Tab Filter** | Help Scout | Sidebar tabs: All, Email, Chat, Social. Quick switch tanpa reload halaman. |
| **Conversation Card with Channel Icon** | Chatwoot | Setiap conversation card di list menampilkan icon channel asal. Agent langsung tahu medium tanpa buka conversation. |
| **Omnichannel Continuity** | Zendesk | Customer yang mulai di chat bisa lanjut di email — conversation thread yang sama, agent berbeda bisa handle tanpa kehilangan konteks. |
| **Channel-specific Composer** | Freshdesk | Composer menyesuaikan channel: WhatsApp punya char limit, Email punya rich text, Chat punya quick reply. |

### Yang Tidak Berhasil

- **Zendesk**: Interface bisa terasa "overwhelming" untuk agent baru karena banyaknya settings dan channel options
- **Intercom**: Phone capabilities terbatas dibanding Zendesk Talk
- **Freshdesk**: Navigasi antar Freshchat (live chat) dan Freshdesk (ticketing) terasa seperti tab switching, bukan unified experience

### Rekomendasi SatuInbox

```
- Sidebar filter: All | WhatsApp | Email | Instagram | Web Chat (chip tabs, bukan dropdown)
- Conversation card: [Channel Icon] [Customer Name] [Preview] [Time] [SLA Badge]
- Default sort: newest activity first
- Channel switch dalam reply: tombol "Reply via..." jika customer punya multiple channel
```

---

## 3. Agent Collision Detection UI

### Best Practices

| Pattern | Platform | Detail |
|---------|----------|--------|
| **Typing Indicator** | Chatwoot, Help Scout | Real-time "Agent X is typing..." banner di atas composer. Menghilang saat agent berhenti mengetik. |
| **Color-coded Presence** | Help Scout | Kuning = agent lain sudah buka conversation, Merah = agent sedang mengetik. Hover untuk lihat nama agent. |
| **Profile Picture Presence** | Help Scout | Saat 2 agent buka conversation yang sama, foto profil muncul di atas thread — visual cue instant. |
| **Assignment-based Prevention** | Chatwoot, Zendesk | Conversation yang sudah assigned ke agent lain menampilkan badge "Assigned to [Name]". Agent lain bisa reassign tapi tidak bisa reply langsung. |
| **Side Conversations** | Zendesk | Agent bisa mulai thread Slack/email internal dari dalam ticket tanpa meninggalkan ticket — mengurangi kebutuhan buka ticket yang sama. |

### Yang Tidak Berhasil

- **Tanpa collision detection**: Customer dapat 2 reply kontradiktif dari 2 agent berbeda, membingungkan dan terlihat tidak profesional
- **Assignment-only approach**: Terlalu kaku — kadang agent butuh "peek" tanpa assign, tapi tidak ada warning kalau ada yang sudah handle

### Rekomendasi SatuInbox

```
Collison Detection Components:
1. TypingIndicator: badge "Sedang diketik oleh {agent_name}..." di atas composer
   - WebSocket real-time update
   - Auto-hide setelah 3 detik idle
2. AgentPresence: avatar stack di header conversation (seperti Google Docs)
3. AssignmentBadge: "Ditangani oleh {agent_name}" di conversation card
   - Klik untuk reassign (dengan konfirmasi)
4. SoftLock: Saat agent mulai mengetik, conversation "soft-lock" ke agent tsb
   - Agent lain dapat warning "Agent X sedang menangani ini"
   - Bisa override dengan klik "Ambil alih"
```

---

## 4. Canned Responses UX

### Best Practices

| Pattern | Platform | Detail |
|---------|----------|--------|
| **Shortcode Trigger** | Chatwoot | Ketik `/` di composer → dropdown muncul dengan daftar canned response. Pilih atau ketik shortcode langsung (`/greeting`). |
| **Variable Substitution** | Chatwoot, Zendesk | Template support variabel: `{{contact.name}}`, `{{agent.name}}`, `{{ticket.id}}`. Auto-replace saat insert. |
| **Searchable Dropdown** | Zendesk, Front | Canned response picker dengan search/filter. Bisa cari berdasarkan nama shortcode atau isi konten. |
| **Preview Before Insert** | Chatwoot | Hover canned response → preview isi lengkap sebelum insert. Menghindari salah pilih template. |
| **Rich Text Templates** | Freshdesk, Zendesk | Canned response mendukung formatting (bold, link, list). Tidak hanya plain text. |
| **Category/Folder** | Freshdesk | Canned response bisa dikelompokkan dalam folder: "Refund", "Shipping", "Greeting". |
| **Per-inbox Scoping** | Chatwoot | Canned response bisa di-scope per inbox (misal: template WhatsApp berbeda dengan template Email). |

### Yang Tidak Berhasil

- **Terlalu banyak template**: Tanpa organisasi yang baik, agent overwhelmed saat mencari template yang tepat
- **Kurangnya variabel**: Template yang terlalu "robotic" karena tidak ada personalisasi
- **Hanya di Pro plan** (Freshdesk): Fitur canned responses di paywall tier tinggi

### Rekomendasi SatuInbox

```
Canned Response System:
1. Trigger: ketik "/" di composer → dropdown picker
2. Atau: Ctrl+Shift+R (keyboard shortcut)
3. Fitur:
   - Shortcode: /refund, /greeting, /closing
   - Variables: {{customer.name}}, {{agent.name}}, {{order.id}}
   - Rich text (Markdown)
   - Folder/category: Greeting, Troubleshooting, Billing, Closing
   - Scope: Global | Per-inbox | Per-team
   - Search: by shortcode, content, category
   - Preview on hover
4. Storage: bisa shared ke team atau personal
```

---

## 5. Customer Context Sidebar

### Best Practices

| Pattern | Platform | Detail |
|---------|----------|--------|
| **Right-side Expandable Panel** | Intercom | Sidebar kanan yang expand/collapse. Menampilkan customer data, custom attributes, conversation history, dan company info. |
| **360° Customer View** | Zendesk | Sidebar menampilkan: profile, ticket history, orders, app activity — semuanya dalam 1 panel. Agent tidak perlu buka tab lain. |
| **Company-level Context** | Help Scout | Selain customer, sidebar juga menampilkan info perusahaan dan conversations dari rekan satu company. |
| **Custom Attributes** | Chatwoot | Sidebar support custom fields yang bisa diisi dari integrasi CRM. Flexible untuk kebutuhan bisnis berbeda. |
| **CRM Integration Pull** | Front | Sidebar menarik data dari Salesforce/HubSpot. Agent lihat deal stage, account value, langsung di sidebar. |
| **Conversation History Timeline** | Chatwoot, Intercom | Sidebar menampilkan timeline semua interaksi customer sebelumnya — clickable untuk buka conversation lama. |

### Struktur Sidebar Ideal

```
Customer Context Sidebar:
┌──────────────────────────────┐
│ 👤 Customer Name             │
│ 📧 email@company.com         │
│ 📱 +62 xxx                   │
│ 🏢 Company Name              │
│──────────────────────────────│
│ Tags: [VIP] [Enterprise]     │
│──────────────────────────────│
│ 📊 Custom Fields             │
│ Plan: Pro                    │
│ MRR: $500                    │
│ Last Order: #1234            │
│──────────────────────────────│
│ 📝 Notes (internal)          │
│ + Add note                   │
│──────────────────────────────│
│ 📜 Recent Conversations (5)  │
│ #1234 - Resolved - 2d ago    │
│ #1230 - Open - WhatsApp      │
│──────────────────────────────│
│ 🔗 Related Tickets           │
│──────────────────────────────│
│ ⚙️ Actions                   │
│ [Block] [Merge] [Export]     │
└──────────────────────────────┘
```

### Rekomendasi SatuInbox

```
- Width: 320px default, resizable (min 280px, max 480px)
- Collapsible: tombol "<<" untuk hide, icon "ℹ️" untuk show
- Sections: accordion-style (click to expand/collapse)
- Custom fields: definisi di admin settings, render sesuai tipe (text, date, select, number)
- Real-time update: sidebar update saat data customer berubah
- Lazy load: conversation history load on scroll, bukan semua sekaligus
```

---

## 6. SLA Indicator Patterns

### Best Practices

| Pattern | Platform | Detail |
|---------|----------|--------|
| **Color-coded Badge** | Chatwoot | Badge di conversation card: 🟢 On Track, 🟡 Due Soon, 🔴 Breached. |
| **Countdown Timer** | Zendesk | Di dalam conversation, tampilkan "First Response: 5m remaining" atau "Resolution: 2h remaining". |
| **Priority-based SLA** | Chatwoot | SLA policy berbeda per priority: Urgent (15min response, 4hr resolution), High (1hr, 8hr), Standard (4hr, 24hr). |
| **SLA Timer in List View** | LiveAgent, BoldDesk | Di conversation list, tampilkan countdown kecil di bawah setiap card. Agent bisa prioritize tanpa buka conversation. |
| **Auto-escalation** | Zendesk, Chatwoot | Saat SLA breached, auto-escalate ke admin/manager. Semua admin dapat notifikasi. |
| **SLA Reports Dashboard** | Chatwoot | Dashboard khusus: hit rate %, total misses, breakdown per agent/policy. |
| **Business Hours Awareness** | Chatwoot, Zendesk | SLA timer hanya hitung jam kerja (business hours). Weekend/holiday tidak dihitung. |

### Visual SLA Indicator

```
Conversation Card:
┌─────────────────────────────────────┐
│ [WA] Budi Santoso  ⏱️ 12m 🔴       │
│ "Order saya belum sampai..."        │
│ Tag: [Urgent] Assign: Agent Sari    │
└─────────────────────────────────────┘

Di dalam conversation header:
┌─────────────────────────────────────┐
│ SLA: First Response ⚠️ 3m tersisa   │
│ SLA: Resolution 🟢 6j tersisa       │
└─────────────────────────────────────┘
```

### Rekomendasi SatuInbox

```
SLA Components:
1. SLABadge: komponen kecil di conversation card
   - Props: status (on_track|due_soon|breached), remaining_minutes
   - Color: green (<50% remaining), yellow (50-90%), red (>90% or breached)
2. SLATimer: inline di conversation header
   - Countdown real-time (update setiap menit)
   - Warning sound/vibration saat <5 menit
3. SLAFilter: filter di sidebar "SLA Breached" untuk quick access
4. SLAPolicy: konfigurasi per priority level
   - Business hours toggle
   - First response time + Resolution time
   - Escalation rules
5. SLADashboard: halaman report terpisah
   - Hit rate chart
   - Misses by agent/priority
   - Trend over time
```

---

## 7. Tag/Label Systems

### Best Practices

| Pattern | Platform | Detail |
|---------|----------|--------|
| **Color-coded Labels** | Chatwoot, Help Scout | Setiap label punya warna assigned. Instant visual recognition di conversation list. |
| **Inline Tag Editor** | Front, Zendesk | Klik area tag di sidebar → dropdown tag picker. Bisa create new tag langsung dari conversation. |
| **Auto-tagging** | Zendesk, Intercom | AI/rule-based auto-tagging: keyword dalam pesan → auto-assign label. |
| **Hierarchical Tags** | Freshdesk | Tag bisa punya parent: "Billing > Refund", "Billing > Invoice Error". |
| **Tag Reports** | Chatwoot | Analytics per label: volume, avg resolution time, CSAT per tag. |
| **Bulk Tag Assignment** | Chatwoot | Select multiple conversations → add/remove labels sekaligus. |
| **Tag Filtering in Views** | Help Scout | Inbox Views bisa filter by tag. Misal: View "VIP" = semua conversation dengan tag "vip". |

### Yang Tidak Berhasil

- **Tag sprawl**: Tanpa governance, team membuat tag redundan (e.g., "urgent", "Urgent", "URGENT")
- **No search**: Tag yang tidak searchable/filterable menjadi tidak berguna
- **Terlalu banyak tag per conversation**: Visual clutter

### Rekomendasi SatuInbox

```
Tag System:
1. TagPicker: dropdown searchable di sidebar
   - Color picker saat create tag baru
   - Recent tags di bagian atas
   - Quick create: ketik nama baru → enter
2. TagDisplay: pill/badge kecil di conversation card
   - Max 3 visible, sisanya "+N more"
   - Hover untuk lihat semua
3. TagAdmin: halaman admin untuk manage tags
   - Predefined tags (team-managed)
   - User-created tags (bisa di-disable per role)
   - Merge/split tags
   - Usage stats
4. Auto-tag rules: if keyword match → apply tag
5. Tag limit: max 10 tags per conversation
```

---

## 8. Bulk Actions

### Best Practices

| Pattern | Platform | Detail |
|---------|----------|--------|
| **Hover-to-select** | Chatwoot | Checkbox muncul saat hover di conversation card. Tidak selalu visible (menghemat space). |
| **Select All** | Chatwoot, Zendesk | "Select all" checkbox di header + "Select all N conversations" link untuk select beyond visible page. |
| **Contextual Toolbar** | Chatwoot | Saat ada selection, toolbar bulk action muncul di bagian atas: [Assign] [Label] [Resolve] [Snooze]. |
| **Context-aware Suggestions** | Chatwoot (coming) | Toolbar menyesuaikan dengan status selected items. Jika semua resolved → suggest "Reopen" bukan "Resolve". |
| **Confirmation Dialog** | Zendesk | Untuk destructive bulk actions (delete, close all) → konfirmasi dengan jumlah affected items. |
| **Progress Indicator** | Zendesk | Saat bulk action berjalan, tampilkan progress bar atau "Processing 3/15...". |

### Yang Tidak Berhasil

- **No undo**: Bulk resolve yang salah → harus manual reopen satu-satu
- **No progress**: Bulk action ke 100+ items tanpa progress → agent tidak tahu selesai atau belum
- **Keyboard shortcut missing**: Power user frustrasi karena harus mouse-click semua

### Rekomendasi SatuInbox

```
Bulk Action System:
1. Selection:
   - Hover checkbox di conversation card
   - Header: "Select all" checkbox (select visible)
   - "Select all 247 conversations matching this filter" link
   - Shift+click untuk range select
2. Action Toolbar (sticky di bawah header):
   - Dynamic: [Assign ▼] [Add Label ▼] [Mark Resolved] [Snooze ▼] [Delete]
   - Badge: "12 selected"
   - "Clear" button
3. Confirmation:
   - <10 items: no confirmation
   - ≥10 items: confirmation dialog dengan count
   - Destructive (delete): always confirm
4. Progress: toast notification "Processing... 8/12 done"
5. Undo: toast dengan "Undo" button (5 detik window)
```

---

## 9. Notification Patterns

### Best Practices

| Pattern | Platform | Detail |
|---------|----------|--------|
| **Real-time Badge Count** | Chatwoot, Intercom | Badge angka di sidebar menu: "My Open (5)", "Unassigned (12)". Update real-time via WebSocket. |
| **Desktop Notifications** | Zendesk, Help Scout | Browser push notification untuk: new assigned conversation, SLA breach, @mention. |
| **In-app Toast** | Chatwoot | Toast notification di corner: "New message from Budi in WhatsApp". Auto-dismiss setelah 5 detik. |
| **Sound Notification** | LiveAgent, Zendesk | Sound alert untuk new message. Bisa di-customize per channel. |
| **Notification Preferences** | Zendesk | Agent bisa set notification preferences: "Notify me only when assigned", "Notify on all mentions". |
| **Digest Mode** | Intercom | Untuk low-priority: bundling notifikasi per 15 menit. Mengurangi noise. |
| **SLA Alert** | Chatwoot | Notifikasi khusus saat SLA approaching breach. Prioritas lebih tinggi dari notifikasi biasa. |

### Rekomendasi SatuInbox

```
Notification System:
1. In-app:
   - Badge count di sidebar menu (WebSocket real-time)
   - Toast notification di bottom-right corner
   - Sound: toggleable per notification type
2. Desktop:
   - Browser Push Notification (dengan permission request)
   - Hanya untuk: assignment, SLA breach, @mention
3. Notification Center:
   - Bell icon di header → dropdown riwayat notifikasi
   - Mark all read
   - Filter: All | Mentions | SLA | Assignments
4. Preferences (per agent):
   - Toggle per type: new_message, assignment, sla_warning, mention
   - Quiet hours: jam istirahat tidak dapat notifikasi
   - Channel-specific: misal hanya WhatsApp yang bunyi
5. Sound: 3 opsi (none, subtle, alert) — default subtle
```

---

## 10. Queue Management

### Best Practices

| Pattern | Platform | Detail |
|---------|----------|--------|
| **Sidebar Queue Views** | Help Scout | Sidebar: "Mine", "Unassigned", "All Open", "Closed". Custom Views bisa ditambah. |
| **Smart Queue (Guided Mode)** | Zendesk | "Guided Mode" menunjukkan agent conversation berikutnya yang harus ditangani. Tidak perlu pilih manual. |
| **Queue Prioritization** | LiveAgent, BoldDesk | Queue ter-sort berdasarkan: SLA urgency > priority > waiting time. |
| **Capacity Management** | Chatwoot | Agent capacity limit: max N active conversations per agent. Prevent overload. |
| **Queue Dashboard** | Zendesk, Freshdesk | Real-time dashboard: queue depth, avg wait time, agents available, SLA compliance. |
| **Queue per Team** | Front, Chatwoot | Queue bisa di-scope per team: "Billing Team Queue", "Technical Queue". |
| **Auto-assignment Rules** | Chatwoot, Zendesk | Round-robin, load-balanced, atau skill-based routing. |

### Queue Structure SatuInbox

```
Sidebar Queue Navigation:
┌──────────────────────────┐
│ 🔍 Search...             │
│──────────────────────────│
│ 📥 All Conversations (47)│
│ 📌 Mine (8)              │
│ ❓ Unassigned (12)       │
│ ⏰ SLA Breached (3)      │
│ 🔴 Urgent (5)            │
│ ⏸️ Snoozed (4)           │
│ ✅ Resolved              │
│──────────────────────────│
│ 📁 Custom Views          │
│   └ VIP Customers (2)    │
│   └ Billing Issues (7)   │
│   + Add View             │
│──────────────────────────│
│ 👥 Teams                 │
│   └ Support (15)         │
│   └ Billing (8)          │
│   └ Technical (12)       │
└──────────────────────────┘

Queue Card Sorting:
Default: SLA urgency descending
Options: Newest | Oldest | Priority | Waiting Time | SLA
```

---

## 11. Komponen UI Spesifik (React/Tailwind)

### Conversation List Card

```tsx
// Komponen ConversationCard
<div className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b">
  {/* Channel Icon */}
  <ChannelIcon channel={conversation.channel} /> {/* WhatsApp/Email/etc */}
  
  {/* Avatar */}
  <Avatar src={conversation.customer.avatar} name={conversation.customer.name} />
  
  {/* Content */}
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between">
      <span className="font-medium truncate">{conversation.customer.name}</span>
      <span className="text-xs text-gray-500">{formatTime(conversation.lastMessageAt)}</span>
    </div>
    <p className="text-sm text-gray-600 truncate">{conversation.lastMessagePreview}</p>
    <div className="flex items-center gap-1 mt-1">
      {conversation.tags.map(tag => <Tag key={tag.id} color={tag.color}>{tag.name}</Tag>)}
      {conversation.assignee && <AssigneeBadge agent={conversation.assignee} />}
    </div>
  </div>
  
  {/* SLA Badge */}
  <SLABadge status={conversation.slaStatus} remaining={conversation.slaRemaining} />
</div>
```

### SLA Badge Component

```tsx
function SLABadge({ status, remaining }) {
  const colors = {
    on_track: 'bg-green-100 text-green-700',
    due_soon: 'bg-yellow-100 text-yellow-700',
    breached: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      <ClockIcon className="w-3 h-3" />
      {formatRemaining(remaining)}
    </span>
  );
}
```

### Typing Indicator (Collision Detection)

```tsx
function TypingIndicator({ agents }) {
  if (!agents?.length) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-t border-blue-100 text-sm text-blue-700">
      <div className="flex -space-x-1">
        {agents.map(a => <Avatar key={a.id} src={a.avatar} size="xs" />)}
      </div>
      <span>{agents.map(a => a.name).join(', ')} sedang mengetik</span>
      <TypingDots className="ml-1" />
    </div>
  );
}
```

### Canned Response Picker

```tsx
function CannedResponsePicker({ onSelect, query }) {
  const responses = useCannedResponses(query); // filter by shortcode/content
  return (
    <div className="absolute bottom-full mb-1 w-full bg-white rounded-lg shadow-lg border max-h-64 overflow-y-auto">
      {responses.map(r => (
        <button key={r.id} onClick={() => onSelect(r)} className="w-full text-left px-3 py-2 hover:bg-gray-50">
          <span className="font-mono text-xs text-blue-600">/{r.shortcode}</span>
          <p className="text-sm text-gray-700 truncate">{r.preview}</p>
        </button>
      ))}
    </div>
  );
}
```

---

## 12. Common UX Complaints dari User Reviews

### Zendesk
- ❌ Interface "overwhelming" untuk agent baru — steep learning curve
- ❌ Pricing mahal untuk fitur AI (add-on terpisah)
- ❌ Admin interface kompleks
- ✅ Keyboard shortcuts dan macros untuk agent berpengalaman sangat powerful

### Intercom
- ❌ Email + messaging blending membingungkan — konteks email hilang
- ❌ Pricing model per-resolution bisa mahal di volume tinggi
- ❌ Limited phone/voice support
- ✅ Messenger-first approach terasa modern dan natural
- ✅ AI (Fin) resolve rate sangat tinggi (up to 65% instant resolution)

### Freshdesk
- ❌ Omnichannel terasa fragmented — perpindahan antar channel tidak seamless
- ❌ Canned responses di paywall tier tinggi (Pro plan)
- ❌ Real-time reporting kurang robust, ada refresh delay
- ✅ Gamification (poin/badge untuk agent) meningkatkan engagement
- ✅ Interface intuitif, onboarding cepat

### Front
- ✅ Collaboration terbaik — internal comments, @mentions, shared drafts
- ✅ Email experience tidak "diluted" oleh format messaging
- ❌ Kurang cocok untuk high-volume ticketing (lebih ke team collaboration)
- ❌ Pricing relatif mahal untuk fitur yang didapat

### Help Scout
- ✅ Clean, simple, agent-friendly — training time sangat singkat
- ✅ Collision detection sederhana tapi efektif (warna kuning/merah)
- ❌ Fitur terbatas dibanding Zendesk — kurang untuk enterprise
- ❌ Reporting tidak sedetail kompetitor

### Chatwoot
- ✅ Open-source, self-host option — kontrol penuh
- ✅ Fitur lengkap: collision detection, canned responses, SLA, bulk actions
- ✅ Interface modern dan bersih
- ❌ Dokumentasi kurang dibanding proprietary platforms
- ❌ Community support instead of dedicated support team

---

## 13. Ringkasan: Prinsip UX untuk SatuInbox

### Prinsip Utama

1. **Reduce Cognitive Load**: Agent tidak perlu mengingat atau mencari — semua konteks ada di depan mata
2. **Speed over Beauty**: Keyboard shortcuts, canned responses, dan quick actions harus prioritized
3. **Consistent Cross-channel**: UX harus terasa sama regardless of channel asal
4. **Progressive Disclosure**: Tampilkan yang penting dulu, detail on-demand
5. **Real-time Everything**: Typing indicator, presence, SLA timer, badge count — semua real-time

### Layout Standar: 3-Panel

```
┌─────────────┬──────────────────────┬───────────────────┐
│  Sidebar    │  Conversation        │  Customer Context │
│  (280px)    │  Thread (flex)       │  (320px)          │
│             │                      │                   │
│  Queues     │  Messages + Notes    │  Profile          │
│  Filters    │                      │  Custom Fields    │
│  Search     │  ──────────────      │  Tags             │
│             │  Reply Composer      │  History          │
│             │  + Canned Response   │  Notes            │
│             │  + Typing Indicator  │  Actions          │
└─────────────┴──────────────────────┴───────────────────┘
```

### Key Metrics yang Harus Dapat Diukur

- First Response Time (FRT)
- Resolution Time
- Agent Utilization (active conversations / capacity)
- SLA Hit Rate %
- CSAT per agent, per channel, per tag
- Canned Response Usage Rate
- Bulk Action Usage Rate

---

## Referensi & Sumber

| Platform | URL |
|----------|-----|
| Chatwoot Features | https://www.chatwoot.com/features |
| Chatwoot Collision Detection | https://www.chatwoot.com/features/collision-detection |
| Chatwoot SLA | https://www.chatwoot.com/features/sla |
| Chatwoot Canned Responses | https://www.chatwoot.com/features/canned-responses |
| Chatwoot Bulk Actions | https://www.chatwoot.com/features/bulk-actions |
| Intercom Inbox | https://www.intercom.com/helpdesk/inbox |
| Front Features | https://www.front.com/features |
| Help Scout Inbox | https://www.helpscout.com/inbox/ |
| Help Scout Collision | https://docs.helpscout.com/article/1583 |
| Zendesk Agent Workspace | https://www.zendesk.com/why-zendesk/ |
| Freshdesk Comparison | https://www.freshworks.com/freshdesk/ |

---

*Last updated: 2026-09-14*  
*Purpose: Reference for SatuInbox UX design decisions*
